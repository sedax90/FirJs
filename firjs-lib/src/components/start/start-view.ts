import { LabelView } from "../common/label/label-view";
import { DomHelper } from "../../utils/dom-helper";
import { ComponentView, Context } from "../../models";
import { PlaceholderView } from "../placeholder/placeholder-view";

export class StartView implements ComponentView {
    private constructor(
        readonly element: SVGElement,
        readonly parent: SVGElement,
        readonly width: number,
        readonly height: number,
        readonly joinX: number,
    ) { }

    public static create(parent: SVGElement, context: Context): StartView {
        const diameter = 60;
        const radius = diameter / 2;

        const element = DomHelper.svg('g', {
            class: "start",
        });

        const circle = DomHelper.svg('circle', {
            class: "start-bg",
            "stroke-width": 1,
            r: radius,
            cx: 0,
            cy: radius,
        });

        const label = LabelView.create('Start', {
            x: radius,
            y: radius,
            containerWidth: diameter,
            containerHeight: diameter,
        });
        DomHelper.translate(label, -radius, 0);

        parent.appendChild(element);
        element.appendChild(circle);
        element.appendChild(label);

        return new StartView(element, parent, diameter, diameter + PlaceholderView.height, diameter / 2);
    }
}