import { Workflow } from "../core/workflow";
import { EventEmitter } from "../events/event-emitter";
import { Context, ClickInteraction, Vector } from "../models";
import { subtract } from "../utils/vector-utils";

export class WorkflowMoveInteraction implements ClickInteraction {
    private constructor(
        readonly workflow: Workflow,
        readonly context: Context,
    ) { }

    private _startPosition!: Vector;
    private _mouseClickOffsetFromComponent!: Vector;
    private _workflowWrapper!: SVGElement;
    private _hasMoved: boolean = false;

    static create(
        workflow: Workflow,
        context: Context,
    ): WorkflowMoveInteraction {
        const interaction = new WorkflowMoveInteraction(workflow, context);
        interaction._workflowWrapper = workflow.view.wrapper;
        return interaction;
    }

    onStart(position: Vector): void {
        this._startPosition = position;

        // Calculate offset from current mouse click position and the component
        const componentClientRect = this._workflowWrapper.getBoundingClientRect();
        const relativeClickPosition = subtract(this._startPosition, {
            x: componentClientRect.x,
            y: componentClientRect.y,
        });

        this._mouseClickOffsetFromComponent = relativeClickPosition;
        this.workflow.view.element.classList.add('moving');
    }

    onMove(delta: Vector): void | ClickInteraction {
        const workflowRect = this.workflow.view.element.getBoundingClientRect();

        let workflowPosition = subtract(this._startPosition, delta);

        // Compensate the workflow view translation
        workflowPosition = subtract(workflowPosition, {
            x: workflowRect.left,
            y: workflowRect.top,
        });
        workflowPosition = subtract(workflowPosition, this._mouseClickOffsetFromComponent);

        const zoomLevel = this.context.designerState.scale;
        this._workflowWrapper.setAttribute('transform', `translate(${workflowPosition?.x ? workflowPosition.x : 0}, ${workflowPosition?.y ? workflowPosition.y : 0}) scale(${zoomLevel})`);
        this.context.designerState.workflowPositionInWorkspace = workflowPosition;

        this._hasMoved = true;
    }

    onEnd(): void {
        this.workflow.view.element.classList.remove('moving');

        const postion = this.context.designerState.workflowPositionInWorkspace;
        if (this._hasMoved && postion) {
            EventEmitter.emitWorkflowPanEvent(this.workflow.view.element, {
                position: postion,
            });
        }
    }

}