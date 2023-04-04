import { ComponentView, Context, Node } from "../../models";
import { DomHelper } from "../../utils/dom-helper";
import { getNodeClasses } from "../../utils/node-utils";
import { JoinView } from "../common/join/join-view";
import { StepView } from "../common/step/step-view";
import { TerminatorEndView } from "./terminator-end-view";

export class TerminatorView implements ComponentView {
    private constructor(
        readonly element: SVGElement,
        readonly width: number,
        readonly height: number,
        readonly joinX: number,
    ) { }

    public static async create(parent: SVGElement, node: Node, context: Context): Promise<TerminatorView> {
        const element = DomHelper.svg('g', {
            class: "terminator",
        });
        element.classList.add(...getNodeClasses(node));

        const stepView = await StepView.create(node, context);
        element.appendChild(stepView.element);

        const connectionHeight = 10;
        const joinX = stepView.width / 2;

        const endView = await TerminatorEndView.create(element, context);
        DomHelper.translate(endView.element, joinX, stepView.height + connectionHeight);

        JoinView.createStraightJoin(element, {
            x: joinX,
            y: stepView.height,
        }, connectionHeight);

        parent.appendChild(element);

        const totalHeight = stepView.height + endView.height + connectionHeight;
        return new TerminatorView(element, stepView.width, totalHeight, joinX);
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
}