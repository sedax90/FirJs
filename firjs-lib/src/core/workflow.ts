import { ComponentInstance, ComponentWithView, Context } from "../models";
import { ClickEvent } from "../utils/event-utils";
import { WorkflowView } from "./workflow-view";

export class Workflow implements ComponentWithView {

    private constructor(
        readonly view: WorkflowView,
        readonly context: Context
    ) { }

    public findByClick(click: ClickEvent): ComponentInstance | null {
        return this.view.findComponentByClick(click);
    }

    public static create(parent: HTMLElement, context: Context): Workflow {
        const view = WorkflowView.create(parent, context);
        return new Workflow(view, context);
    }
}