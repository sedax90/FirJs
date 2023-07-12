import { End } from "../components/end/end";
import { Sequence } from "../components/sequence/sequence";
import { Start } from "../components/start/start";
import { DomHelper } from "../utils/dom-helper";
import { ComponentInstance, ElementView, Context } from "../models";
import { ClickEvent } from "../utils/event-utils";
import { JoinView } from "../components/common/join/join-view";
import { PlaceholderFinder } from "../utils/placeholder-finder";
import { WorkflowScaleInteraction } from "../interactions/workflow-scale-interaction";

export class WorkflowView implements ElementView {

    private constructor(
        readonly element: SVGElement,
        readonly parent: HTMLElement | SVGElement,
        readonly context: Context,
        readonly width: number,
        readonly height: number,
        readonly joinX: number,
        readonly joinY: number,
    ) { }

    wrapper!: SVGElement;
    mainSequence!: Sequence;

    public static async create(parent: HTMLElement, context: Context): Promise<WorkflowView> {
        const flowMode = context.designerState.flowMode;
        const placeholderWidth = context.options.style.placeholder.width;
        const placeholderHeight = context.options.style.placeholder.height;

        const svg = DomHelper.svg('svg', {
            class: "workflow-root",
            width: '100%',
            height: '100%',
        });

        // Append svg defs        
        WorkflowView._addSvgDefs(svg);

        const workflowWrapper = DomHelper.svg('g', {
            class: "workflow-wrapper",
            fill: "transparent",
        });

        const isInfinite = context.options.infinite;

        const nodes = context.tree;
        const sequence = await Sequence.create(nodes, null, workflowWrapper, context);

        let maxJoinX = sequence.view.joinX;
        let maxJoinY = sequence.view.joinY;
        let totalWidth = sequence.view.width;
        let totalHeight = sequence.view.height;
        let start!: Start;
        let end!: End;

        if (!isInfinite) {
            start = Start.create(workflowWrapper, context);
            totalWidth = totalWidth + start.view.width;
            totalHeight = totalHeight + start.view.height;

            end = End.create(workflowWrapper, context);
        }

        if (flowMode === 'vertical') {
            if (!isInfinite) {
                // Add last join
                JoinView.createConnectionJoin(workflowWrapper, { x: maxJoinX, y: totalHeight - placeholderHeight }, placeholderHeight, context);
            }

            if (start) {
                DomHelper.translate(sequence.view.element, 0, start.view.height);
                DomHelper.translate(start.view.element, maxJoinX - start.view.joinX, 0);
            }

            if (end) {
                DomHelper.translate(end.view.element, maxJoinX - end.view.joinX, totalHeight);
                totalHeight = totalHeight + end.view.height;
            }
        }
        else {
            if (!isInfinite) {
                // Add last join
                JoinView.createConnectionJoin(workflowWrapper, { x: totalWidth - placeholderWidth, y: maxJoinY }, placeholderWidth, context);
            }

            if (start) {
                DomHelper.translate(sequence.view.element, start.view.width, 0);
                DomHelper.translate(start.view.element, 0, maxJoinY - start.view.joinY);
            }

            if (end) {
                DomHelper.translate(end.view.element, totalWidth, maxJoinY - end.view.joinY);
                totalWidth = totalWidth + end.view.width;
            }
        }

        svg.appendChild(workflowWrapper);
        parent.appendChild(svg);

        const workflowView = new WorkflowView(svg, parent, context, totalWidth, totalHeight, maxJoinX, maxJoinY);
        workflowView.mainSequence = sequence;
        workflowView.wrapper = workflowWrapper;

        if (!context.designerState.workflowPositionInWorkspace) {
            workflowView.fitAndCenter();
        }
        else {
            const workflowPosition = context.designerState.workflowPositionInWorkspace;
            const zoomLevel = context.designerState.scale;
            workflowWrapper.setAttribute('transform', `translate(${workflowPosition.x}, ${workflowPosition.y}) scale(${zoomLevel})`);
        }

        return workflowView;
    }

    findByClick(click: ClickEvent): ComponentInstance | null {
        return this.mainSequence.findByClick(click);
    }

    findById(nodeId: string): ComponentInstance | null {
        return this.mainSequence.findById(nodeId);
    }

    isHover(target: Element): ComponentInstance | null {
        return this.mainSequence.isHover(target);
    }

    // Center workflowWrapper into svg
    fitAndCenter(): void {
        const parentRect = this.parent.getBoundingClientRect();
        const parentHeight = parentRect.height;
        const parentWidth = parentRect.width;

        const workflowPadding = 50;

        let scale = Math.min(parentWidth / (this.width + workflowPadding), parentHeight / (this.height + workflowPadding));
        if (scale > WorkflowScaleInteraction.maxZoomLevel) {
            scale = WorkflowScaleInteraction.maxZoomLevel;
        }

        const scaledWidth = this.width * scale;
        const scaledHeight = this.height * scale;

        const offsetX = (parentWidth - scaledWidth) / 2;
        const offsetY = (parentHeight - scaledHeight) / 2;

        let workflowPosition = {
            x: offsetX,
            y: offsetY,
        }

        this.context.designerState.scale = scale;
        this.context.designerState.workflowPositionInWorkspace = workflowPosition;

        this.wrapper.setAttribute('transform', `translate(${workflowPosition.x}, ${workflowPosition.y}) scale(${scale})`);

        PlaceholderFinder.getInstance(this.context).recalculatePositions();
    }

    private static _addSvgDefs(svg: SVGElement): void {
        const marker = DomHelper.svg('marker', {
            id: "arrowEnd",
            refX: "10",
            refY: "5",
            viewBox: '0 0 10 10',
            markerUnits: "strokeWidth",
            markerWidth: "6",
            markerHeight: "6",
            orient: "auto",
        });
        marker.appendChild(DomHelper.svg('path', {
            class: "marker-path",
            d: "M 0 0 L 10 5 L 0 10 z",
        }));

        const defs = DomHelper.svg('defs');
        defs.appendChild(marker);
        svg.appendChild(defs);
    }
}