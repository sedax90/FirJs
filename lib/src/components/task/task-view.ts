import { StepView } from "../common/step/step-view";
import { DomHelper } from "../../utils/dom-helper";
import { ComponentView, Context, Node } from "../../models";
import { getNodeClasses } from "../../utils/node-utils";

export class TaskView implements ComponentView {
    private constructor(
        readonly element: SVGElement,
        readonly width: number,
        readonly height: number,
        readonly joinX: number,
    ) { }

    private _selectableElement!: SVGElement;

    public static async create(parent: SVGElement, node: Node, context: Context): Promise<TaskView> {
        const element = DomHelper.svg('g', {
            class: "task",
        });
        element.classList.add(...getNodeClasses(node));

        const stepView = await StepView.create(node, context);
        element.appendChild(stepView.element);
        parent.appendChild(element);

        const taskView = new TaskView(element, stepView.width, stepView.height, stepView.width / 2);
        taskView._selectableElement = element;
        return taskView;
    }

    setDragging(value: boolean): void {
        if (value) {
            this.element.classList.add('dragging');
        }
        else {
            this.element.classList.remove('dragging');
        }
    }

    setSelected(status: boolean): void {
        if (status) {
            this.element.classList.add('selected');
        }
        else {
            this.element.classList.remove('selected');
        }
    }

    getSelectableElement(): HTMLElement | SVGElement | null {
        return this._selectableElement;
    }
}