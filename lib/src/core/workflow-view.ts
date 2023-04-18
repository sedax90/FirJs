import { End } from "../components/end/end";
import { PlaceholderView } from "../components/placeholder/placeholder-view";
import { Sequence } from "../components/sequence/sequence";
import { Start } from "../components/start/start";
import { DomHelper } from "../utils/dom-helper";
import { ComponentInstance, ElementView, Context } from "../models";
import { ClickEvent } from "../utils/event-utils";
import { JoinView } from "../components/common/join/join-view";
import { PlaceholderFinder } from "../utils/placeholder-finder";

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
        const direction = context.designerState.direction;
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

        const start = Start.create(workflowWrapper, context);
        let maxJoinX = start.view.joinX;
        let maxJoinY = start.view.joinY;

        const nodes = context.tree;
        const sequence = await Sequence.create(nodes, null, workflowWrapper, context);

        const sequenceCenterX = sequence.view.joinX;
        if (sequenceCenterX > maxJoinX) {
            maxJoinX = sequenceCenterX;
        }
        else if (sequenceCenterX === 0) {
            maxJoinX = placeholderWidth / 2;
        }

        const sequenceCenterY = sequence.view.joinY;
        if (sequenceCenterY > maxJoinY) {
            maxJoinY = sequenceCenterY;
        }
        else if (sequenceCenterY === 0) {
            maxJoinY = placeholderHeight / 2;
        }

        let totalWidth = start.view.width + sequence.view.width;
        let totalHeight = start.view.height + sequence.view.height;

        const end = End.create(workflowWrapper, context);

        if (direction === 'vertical') {
            // Add join to start element
            JoinView.createConnectionJoin(workflowWrapper, { x: maxJoinX, y: start.view.height - placeholderHeight }, placeholderHeight, context);

            // Add last join
            JoinView.createConnectionJoin(workflowWrapper, { x: maxJoinX, y: totalHeight - placeholderHeight }, placeholderHeight, context);

            DomHelper.translate(sequence.view.element, 0, start.view.height);
            DomHelper.translate(start.view.element, maxJoinX - start.view.joinX, 0);
            DomHelper.translate(end.view.element, maxJoinX - end.view.joinX, totalHeight);
        }
        else {
            // Add join to start element
            JoinView.createConnectionJoin(workflowWrapper, { x: start.view.width - placeholderWidth, y: maxJoinY }, placeholderWidth, context);

            // Add last join
            JoinView.createConnectionJoin(workflowWrapper, { x: totalWidth - placeholderWidth, y: maxJoinY }, placeholderWidth, context);

            DomHelper.translate(sequence.view.element, start.view.width, 0);
            DomHelper.translate(start.view.element, 0, maxJoinY - start.view.joinY);
            DomHelper.translate(end.view.element, totalWidth, maxJoinY - end.view.joinY);
        }

        totalWidth = totalWidth + end.view.width - placeholderWidth;
        totalHeight = totalHeight + end.view.height - placeholderHeight;

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

    // Center workflowWrapper into svg
    fitAndCenter(): void {
        const parentRect = this.parent.getBoundingClientRect();
        const parentHeight = parentRect.height;
        const parentWidth = parentRect.width;

        const workflowPadding = 50;
        const scale = Math.min(parentWidth / (this.width + workflowPadding), parentHeight / (this.height + workflowPadding));

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

        PlaceholderFinder.getInstance().recalculatePositions();
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