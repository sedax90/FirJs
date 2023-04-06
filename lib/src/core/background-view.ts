import { DomHelper } from "../utils/dom-helper";
import { ElementView } from "../models";

export class BackgroundView implements ElementView {
    private constructor(
        readonly element: HTMLElement | SVGElement,
        readonly parent: HTMLElement | SVGElement,
    ) { }

    public static create(parent: HTMLElement): BackgroundView {
        const canvas = DomHelper.svg('svg', {
            class: 'bg',
            width: "100%",
            height: "100%",
        });

        const defs = DomHelper.svg('defs');

        const gridPattern = DomHelper.svg('pattern', {
            id: "bg-pattern",
            patternUnits: "userSpaceOnUse",
            width: "16",
            height: "16",
        });

        const background = DomHelper.svg('rect', {
            fill: "url(#bg-pattern)",
            width: "100%",
            height: "100%",
        });

        const gridPatternCircle = DomHelper.svg("circle", {
            class: "grid-pattern-circle",
            r: 1,
            cx: 1,
            cy: 1,
        });


        canvas.appendChild(defs);
        canvas.appendChild(background);

        defs.appendChild(gridPattern);
        gridPattern.appendChild(gridPatternCircle);

        parent.appendChild(canvas);

        return new BackgroundView(canvas, parent);
    }
}