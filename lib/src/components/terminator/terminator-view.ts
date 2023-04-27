import { ComponentView, Context, Node } from "../../models";
import { DomHelper } from "../../utils/dom-helper";
import { addHasErrorIfNecessary } from "../../utils/error-helper";
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
        readonly joinY: number,
    ) { }

    private _selectableElement!: SVGElement;

    static async create(parentElement: SVGElement, node: Node, parentNode: Node | null, context: Context): Promise<TerminatorView> {
        let terminatorView!: TerminatorView;

        if (context.userDefinedOverriders?.overrideView && context.userDefinedOverriders.overrideView?.terminator) {
            terminatorView = await context.userDefinedOverriders.overrideView.terminator({ node, parent: parentNode, parentElement }, context) as TerminatorView;
        }

        if (!terminatorView) {
            const element = DomHelper.svg('g', {
                class: "terminator",
            });
            element.classList.add(...getNodeClasses(node));

            const stepView = await StepView.create(node, context);
            element.appendChild(stepView.element);

            const connectionSize = 10;
            const joinX = stepView.width / 2;
            const joinY = stepView.height / 2;

            const endView = await TerminatorEndView.create(element, context);

            const flowMode = context.designerState.flowMode;
            if (flowMode === 'vertical') {
                DomHelper.translate(endView.element, joinX, stepView.height + connectionSize);
                JoinView.createVerticalStraightJoin(element, {
                    x: joinX,
                    y: stepView.height,
                }, connectionSize);
            }
            else {
                DomHelper.translate(endView.element, stepView.width + endView.width / 2 + connectionSize, joinY - endView.height / 2);
                JoinView.createHorizontalStraightJoin(element, {
                    x: stepView.width,
                    y: joinY,
                }, connectionSize);
            }


            let width;
            let height;

            if (flowMode === 'vertical') {
                width = stepView.width;
                height = stepView.height + endView.height + connectionSize;
            }
            else {
                width = stepView.width + endView.width + connectionSize;
                height = stepView.height;
            }

            terminatorView = new TerminatorView(element, width, height, joinX, joinY);
        }

        parentElement.appendChild(terminatorView.element);

        await addHasErrorIfNecessary(terminatorView.element, node, parentNode, context);

        terminatorView._selectableElement = terminatorView.element;
        return terminatorView;
    }

    static async fromView(node: Node, parentNode: Node | null, componentView: {
        element: SVGElement,
        parentElement: SVGElement,
        width: number,
        height: number,
        joinX: number,
        joinY: number,
    }, context: Context): Promise<TerminatorView> {
        const taskView = new TerminatorView(componentView.element as SVGElement, componentView.width, componentView.height, componentView.joinX, componentView.joinY);

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