import { Workflow } from "../core/workflow";
import { Context, WheelInteraction } from "../models";

export class WorkflowScaleInteraction implements WheelInteraction {
    private constructor(
        readonly workflow: Workflow,
        readonly context: Context,
    ) { }

    private _workflowWrapper!: SVGElement;
    private _minZoomLevel: number = 0.05;
    private _maxZoomLevel: number = 2;
    private _zoomStep: number = 0.05;

    static create(
        workflow: Workflow,
        context: Context,
    ): WorkflowScaleInteraction {
        const interaction = new WorkflowScaleInteraction(workflow, context);
        interaction._workflowWrapper = workflow.view.wrapper;
        return interaction;
    }

    onWheel(delta: number): void {
        let zoomLevel = this.context.designerState?.zoomLevel ? this.context.designerState.zoomLevel : 1;

        if (delta > 0) {
            // Scroll down
            zoomLevel = zoomLevel - this._zoomStep;
            if (zoomLevel < this._minZoomLevel) {
                zoomLevel = this._minZoomLevel;
            }
        }
        else {
            // Scroll up
            zoomLevel = zoomLevel + this._zoomStep;
            if (zoomLevel > this._maxZoomLevel) {
                zoomLevel = this._maxZoomLevel;
            }
        }

        const workflowPosition = this.context.designerState.workspacePosition;

        const positionX = workflowPosition?.x ? workflowPosition.x : 0;
        const positionY = workflowPosition?.y ? workflowPosition.y : 0;

        this._workflowWrapper.setAttribute('transform', `translate(${positionX}, ${positionY}) scale(${zoomLevel})`);
        this.context.designerState.zoomLevel = zoomLevel;
    }

}