import { LabelView } from "../common/label/label-view";
import { DomHelper } from "../../utils/dom-helper";
import { Context } from "../../models";

export class TerminatorEndView {
    private constructor(
        readonly element: SVGElement,
        readonly parent: SVGElement,
        readonly width: number,
        readonly height: number,
        readonly joinX: number,
    ) { }

    public static create(parent: SVGElement, context: Context): TerminatorEndView {
        const diameter = 30;
        const radius = diameter / 2;

        const element = DomHelper.svg('g', {
            class: "end terminator-end",
        });

        const circle = DomHelper.svg('circle', {
            class: "end-bg",
            "stroke-width": 1,
            r: radius,
            cx: 0,
            cy: radius,
        });

        const label = LabelView.create('End', context);
        DomHelper.translate(label.element, 0, radius);

        element.appendChild(circle);
        element.appendChild(label.element);
        parent.appendChild(element);

        return new TerminatorEndView(element, parent, diameter, diameter, diameter / 2);
    }
}