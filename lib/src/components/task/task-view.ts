import { StepView } from "../common/step/step-view";
import { DomHelper } from "../../utils/dom-helper";
import { ComponentView, Context, Node } from "../../models";
import { getNodeClasses } from "../../utils/node-utils";
import { addHasErrorIfNecessary } from "../../utils/error-helper";

export class TaskView implements ComponentView {
    private constructor(
        readonly element: SVGElement,
        readonly width: number,
        readonly height: number,
        readonly joinX: number,
        readonly joinY: number,
    ) { }

    private _selectableElement!: SVGElement;

    static async create(parentElement: SVGElement, node: Node, parentNode: Node | null, context: Context): Promise<TaskView> {
        let taskView!: TaskView;

        if (context.userDefinedOverriders?.overrideView && context.userDefinedOverriders.overrideView?.task) {
            taskView = await context.userDefinedOverriders.overrideView.task({ node, parent: parentNode, parentElement }, context) as TaskView;
        }

        if (!taskView) {
            const element = DomHelper.svg('g', {
                class: "task",
            });
            element.classList.add(...getNodeClasses(node));

            const stepView = await StepView.create(node, context);
            element.appendChild(stepView.element);

            taskView = new TaskView(element, stepView.width, stepView.height, stepView.width / 2, stepView.height / 2);
        }

        parentElement.appendChild(taskView.element);

        await addHasErrorIfNecessary(taskView.element, node, parentNode, context);

        taskView._selectableElement = taskView.element;
        return taskView;
    }

    static async fromView(node: Node, parentNode: Node | null, componentView: {
        element: SVGElement,
        parentElement: SVGElement,
        width: number,
        height: number,
        joinX: number,
        joinY: number,
    }, context: Context): Promise<TaskView> {
        const taskView = new TaskView(componentView.element as SVGElement, componentView.width, componentView.height, componentView.joinX, componentView.joinY);

        componentView.parentElement.appendChild(taskView.element);

        await addHasErrorIfNecessary(taskView.element, node, parentNode, context);

        taskView._selectableElement = taskView.element;
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

    setHover(isHover: boolean): void {
        if (isHover) {
            this.element.classList.add('hover');
        }
        else {
            this.element.classList.remove('hover');
        }
    }
}