import { ComponentInstance, ComponentWithView, Context } from "../models";
import { ClickEvent } from "../utils/event-utils";
import { WorkflowView } from "./workflow-view";

export class Workflow implements ComponentWithView {

    private constructor(
        readonly view: WorkflowView,
        readonly context: Context
    ) { }

    public findByClick(click: ClickEvent): ComponentInstance | null {
        return this.view.findByClick(click);
    }

    public findById(nodeId: string): ComponentInstance | null {
        return this.view.findById(nodeId);
    }

    public isHover(target: Element): ComponentInstance | null {
        return this.view.isHover(target);
    }

    public static async create(parent: HTMLElement, context: Context): Promise<Workflow> {
        const view = await WorkflowView.create(parent, context);
        return new Workflow(view, context);
    }
}