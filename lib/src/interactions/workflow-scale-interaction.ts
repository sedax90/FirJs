import { Workflow } from "../core/workflow";
import { EventEmitter } from "../events/event-emitter";
import { Context, Vector, WheelInteraction } from "../models";

export class WorkflowScaleInteraction implements WheelInteraction {
    private constructor(
        readonly workflow: Workflow,
        readonly context: Context,
    ) { }

    private _workflowWrapper!: SVGElement;
    private _minZoomLevel: number = 0.05;
    private _maxZoomLevel: number = 2;
    private _scaleStep: number = 1.1;

    static create(
        workflow: Workflow,
        context: Context,
    ): WorkflowScaleInteraction {
        const interaction = new WorkflowScaleInteraction(workflow, context);
        interaction._workflowWrapper = workflow.view.wrapper;
        return interaction;
    }

    onWheel(delta: number, mousePosition: Vector): void {
        const currentScale = this.context.designerState?.scale ? this.context.designerState.scale : 1;
        let nextScale = currentScale;

        if (delta > 0) {
            // Scroll down
            nextScale = nextScale / this._scaleStep;
            if (nextScale < this._minZoomLevel) {
                nextScale = this._minZoomLevel;
            }
        }
        else {
            // Scroll up
            nextScale = nextScale * this._scaleStep;
            if (nextScale > this._maxZoomLevel) {
                nextScale = this._maxZoomLevel;
            }
        }

        // Prevent zoom if we have reached max or min scale value.
        if (currentScale === nextScale) {
            return;
        }

        const workspaceRect = this.context.designerState.workspaceRect;
        if (workspaceRect) {
            mousePosition.x = mousePosition.x - workspaceRect.left;
            mousePosition.y = mousePosition.y - workspaceRect.top;
        }

        const workflowPosition = this.context.designerState.workflowPositionInWorkspace;
        let workflowPositionX = workflowPosition?.x ? workflowPosition.x : 0;
        let workflowPositionY = workflowPosition?.y ? workflowPosition.y : 0;

        // Pan the svg while zooming
        const ratio = 1 - nextScale / currentScale;
        workflowPositionX += (mousePosition.x - workflowPositionX) * ratio;
        workflowPositionY += (mousePosition.y - workflowPositionY) * ratio;

        this._workflowWrapper.setAttribute('transform', `translate(${workflowPositionX}, ${workflowPositionY}) scale(${nextScale})`);

        this.context.designerState.scale = nextScale;
        this.context.designerState.workflowPositionInWorkspace = {
            x: workflowPositionX,
            y: workflowPositionY,
        }

        EventEmitter.emitWorkflowScaleEvent(this.workflow.view.element, {
            scale: this.context.designerState.scale,
        });
    }

}