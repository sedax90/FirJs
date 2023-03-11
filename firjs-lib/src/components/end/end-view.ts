import { LabelView } from "../common/label/label-view";
import { DomHelper } from "../../utils/dom-helper";
import { ComponentView } from "../../models";

export class EndView implements ComponentView {
    private constructor(
        readonly element: SVGElement,
        readonly parent: SVGElement,
        readonly width: number,
        readonly height: number,
        readonly joinX: number,
    ) { }

    public static create(parent: SVGElement): EndView {
        const diameter = 60;
        const radius = diameter / 2;

        const element = DomHelper.svg('g', {
            class: "end",
        });

        const circle = DomHelper.svg('circle', {
            class: "end-bg",
            "stroke-width": 1,
            r: radius,
            cx: 0,
            cy: radius,
        });

        const label = LabelView.create('End', {
            x: radius,
            y: radius,
            containerWidth: diameter,
            containerHeight: diameter,
        });
        DomHelper.translate(label, -30, 0);

        element.appendChild(circle);
        element.appendChild(label);
        parent.appendChild(element);

        return new EndView(element, parent, diameter, diameter, diameter / 2);
    }
}