import { Context, Vector } from "../../../models";
import { DomHelper } from "../../../utils/dom-helper";


export class JoinView {
    public static createStraightJoin(parent: SVGElement, start: Vector, height: number): SVGElement {

        const line = DomHelper.svg('line', {
            class: "join-line",
            x1: start.x,
            y1: start.y,
            x2: start.x,
            y2: start.y + height,
        });

        parent.insertBefore(line, parent.firstChild);
        return line;
    }

    public static createConnectionJoin(parent: SVGElement, start: Vector, height: number, context: Context): SVGElement {
        const line = JoinView.createStraightJoin(parent, start, height);

        if (height) {
            line.setAttribute("marker-end", "url(#arrowEnd)");
        }

        return line;
    }

    public static createJoins(parent: SVGElement, start: Vector, targets: Vector[]) {
        const totalTarget = targets.length;
        if (totalTarget === 0) return;

        for (let i = 0; i < totalTarget; i++) {
            const end = targets[i];

            // const d = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
            // const d = `M ${start.x} ${start.y} C ${c1x1} ${c1y1} ${c1x2} ${c1y2} ${end.x} ${end.y} L ${end.x} ${end.y}`;
            const d = `M ${start.x} ${start.y} L ${end.x} ${start.y} L ${end.x} ${end.y}`;
            parent.insertBefore(DomHelper.svg('path', {
                class: "join-line",
                d: d,
            }), parent.firstChild);
        }
    }
}