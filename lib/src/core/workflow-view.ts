import { End } from "../components/end/end";
import { PlaceholderView } from "../components/placeholder/placeholder-view";
import { Sequence } from "../components/sequence/sequence";
import { Start } from "../components/start/start";
import { DomHelper } from "../utils/dom-helper";
import { ComponentInstance, ElementView, Context } from "../models";
import { ClickEvent } from "../utils/event-utils";
import { JoinView } from "../components/common/join/join-view";

export class WorkflowView implements ElementView {

    private constructor(
        readonly element: SVGElement,
        readonly parent: HTMLElement | SVGElement,
        readonly context: Context,
        readonly width: number,
        readonly height: number,
        readonly joinX: number,
    ) { }

    wrapper!: SVGElement;
    mainSequence!: Sequence;

    public static async create(parent: HTMLElement, context: Context): Promise<WorkflowView> {
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

        const nodes = context.tree;
        const sequence = await Sequence.create(nodes, null, workflowWrapper, context);
        const sequenceCenter = sequence.view.joinX;

        if (sequenceCenter > maxJoinX) {
            maxJoinX = sequenceCenter;
        }
        else if (sequenceCenter === 0) {
            maxJoinX = PlaceholderView.width / 2;
        }

        let totalHeight = start.view.height + sequence.view.height;

        const end = End.create(workflowWrapper, context);

        // Add join to start element
        JoinView.createConnectionJoin(workflowWrapper, { x: maxJoinX, y: start.view.height - PlaceholderView.height }, PlaceholderView.height, context);

        // Add last join
        JoinView.createConnectionJoin(workflowWrapper, { x: maxJoinX, y: totalHeight - PlaceholderView.height }, PlaceholderView.height, context);

        DomHelper.translate(sequence.view.element, 0, start.view.height);

        // Center start and stop
        DomHelper.translate(start.view.element, maxJoinX, 0);
        DomHelper.translate(end.view.element, maxJoinX, totalHeight);

        const workflowOffsetY = 10;
        totalHeight = totalHeight + end.view.height + workflowOffsetY;

        svg.appendChild(workflowWrapper);
        parent.appendChild(svg);

        const workflowView = new WorkflowView(svg, parent, context, workflowWrapper.clientWidth, totalHeight, maxJoinX);
        workflowView.mainSequence = sequence;
        workflowView.wrapper = workflowWrapper;

        if (!context.designerState.workspacePosition) {
            workflowView.fitAndCenter();
        }
        else {
            const workflowPosition = context.designerState.workspacePosition;
            const zoomLevel = context.designerState.zoomLevel;
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
        const workflowOffsetY = 10;

        let zoomLevel = this.context.designerState.zoomLevel;
        const parentHeight = parentRect.height - workflowOffsetY;
        if (this.height > parentHeight) {
            // We have to scale the workflow because it's too big
            zoomLevel = (parentHeight / this.height);
        }

        const workflowOffsetX = (parentRect.width / 2) - (this.joinX * zoomLevel);
        let workflowPosition = {
            x: workflowOffsetX,
            y: workflowOffsetY,
        }

        this.context.designerState.zoomLevel = zoomLevel;
        this.context.designerState.workspacePosition = workflowPosition;

        this.wrapper.setAttribute('transform', `translate(${workflowPosition.x}, ${workflowPosition.y}) scale(${zoomLevel})`);
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