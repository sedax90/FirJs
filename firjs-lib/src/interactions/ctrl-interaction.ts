import { Workflow } from "../core/workflow";
import { Context, KeyboardInteraction } from "../models";

export class CtrlInteraction implements KeyboardInteraction {

    private constructor(
        readonly workflow: Workflow,
        readonly context: Context,
    ) { }

    static create(workflow: Workflow, context: Context): CtrlInteraction {
        return new CtrlInteraction(workflow, context);
    }

    onPress(e: KeyboardEvent): void {
        this.context.designerState.isPressingCtrl = true;
        this.workflow.view.element.classList.add('moving');
    }

    onRelease(e: KeyboardEvent): void {
        this.context.designerState.isPressingCtrl = false;
        this.workflow.view.element.classList.remove('moving');
    }

}