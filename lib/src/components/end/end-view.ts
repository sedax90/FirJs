import { LabelView } from "../common/label/label-view";
import { DomHelper } from "../../utils/dom-helper";
import { ComponentView, Context } from "../../models";

export class EndView implements ComponentView {
    private constructor(
        readonly element: SVGElement,
        readonly parent: SVGElement,
        readonly width: number,
        readonly height: number,
        readonly joinX: number,
        readonly joinY: number,
    ) { }

    public static create(parent: SVGElement, context: Context): EndView {
        const diameter = 60;
        const radius = diameter / 2;

        const element = DomHelper.svg('g', {
            class: "end",
        });

        const circle = DomHelper.svg('circle', {
            class: "end-bg",
            "stroke-width": 1,
            r: radius,
            cx: radius,
            cy: radius,
        });

        const label = LabelView.create('End', context);
        DomHelper.translate(label.element, radius, radius);

        parent.appendChild(element);
        element.appendChild(circle);
        element.appendChild(label.element);

        return new EndView(element, parent, diameter, diameter, radius, radius);
    }

    getSelectableElement(): HTMLElement | SVGElement | null {
        return null;
    }
}