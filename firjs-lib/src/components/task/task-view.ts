import { StepView } from "../common/step/step-view";
import { DomHelper } from "../../utils/dom-helper";
import { ComponentView, Context, Node } from "../../models";

export class TaskView implements ComponentView {
    private constructor(
        readonly element: SVGElement,
        readonly width: number,
        readonly height: number,
        readonly joinX: number,
    ) { }

    public static create(parent: SVGElement, node: Node, context: Context): TaskView {
        const element = DomHelper.svg('g', {
            class: "task",
        });

        element.appendChild(StepView.create(node, context));
        parent.appendChild(element);

        return new TaskView(element, StepView.width, StepView.height, StepView.width / 2);
    }

    setDragging(value: boolean): void {
        if (value) {
            this.element.setAttribute('opacity', '0.5');
        }
        else {
            this.element.removeAttribute('opacity');
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
}