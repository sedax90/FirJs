import { Context, Vector } from "../../../models";
import { DomHelper } from "../../../utils/dom-helper";


export class JoinView {
    public static createStraightJoin(parent: SVGElement, start: Vector, height: number, context: Context): SVGElement {

        const line = DomHelper.svg('line', {
            class: "join-line",
            x1: start.x,
            y1: start.y,
            x2: start.x,
            y2: start.y + height,
        });

        parent.appendChild(line);
        return line;
    }

    public static createConnectionJoin(parent: SVGElement, start: Vector, height: number, context: Context): SVGElement {
        const line = JoinView.createStraightJoin(parent, start, height, context);

        if (height) {
            line.setAttribute("marker-end", "url(#arrowEnd)");
        }

        return line;
    }
}