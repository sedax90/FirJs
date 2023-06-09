import { Context, Vector } from "../../../models";
import { DomHelper } from "../../../utils/dom-helper";

export class JoinView {
    static createVerticalStraightJoin(parent: SVGElement, start: Vector, height: number): SVGElement {
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

    static createHorizontalStraightJoin(parent: SVGElement, start: Vector, width: number): SVGElement {
        const line = DomHelper.svg('line', {
            class: "join-line",
            x1: start.x,
            y1: start.y,
            x2: start.x + width,
            y2: start.y,
        });

        parent.insertBefore(line, parent.firstChild);
        return line;
    }

    static createConnectionJoin(parent: SVGElement, start: Vector, dimension: number, context: Context): SVGElement {
        const line = (context.designerState.flowMode === 'vertical') ? JoinView.createVerticalStraightJoin(parent, start, dimension) : JoinView.createHorizontalStraightJoin(parent, start, dimension);

        if (dimension) {
            line.setAttribute("marker-end", "url(#arrowEnd)");
        }

        return line;
    }

    static createTwoAnglesVerticalJoins(parent: SVGElement, start: Vector, targets: Vector[], firstAngleOffset: number = 20): void {
        const totalTarget = targets.length;
        if (totalTarget === 0) return;

        for (let i = 0; i < totalTarget; i++) {
            const end = targets[i];

            const d = `M ${start.x} ${start.y} L ${start.x} ${start.y + firstAngleOffset} L ${start.x} ${start.y + firstAngleOffset} L ${end.x} ${start.y + firstAngleOffset} L ${end.x} ${end.y}`;
            parent.insertBefore(DomHelper.svg('path', {
                class: "join-line",
                d: d,
            }), parent.firstChild);
        }
    }

    static createTwoAnglesHorizontalJoins(parent: SVGElement, start: Vector, targets: Vector[], firstAngleOffset: number = 20): void {
        const totalTarget = targets.length;
        if (totalTarget === 0) return;

        for (let i = 0; i < totalTarget; i++) {
            const end = targets[i];

            const d = `M ${start.x} ${start.y} L ${start.x + firstAngleOffset} ${start.y} L ${start.x + firstAngleOffset} ${end.y} L ${end.x} ${end.y}`;
            parent.insertBefore(DomHelper.svg('path', {
                class: "join-line",
                d: d,
            }), parent.firstChild);
        }
    }

    static createOneAngleVerticalJoins(parent: SVGElement, start: Vector, targets: Vector[]): void {
        const totalTarget = targets.length;
        if (totalTarget === 0) return;

        for (let i = 0; i < totalTarget; i++) {
            const end = targets[i];

            const d = `M ${start.x} ${start.y} L ${end.x} ${start.y} L ${end.x} ${end.y}`;
            parent.insertBefore(DomHelper.svg('path', {
                class: "join-line",
                d: d,
            }), parent.firstChild);
        }
    }

    static createOneAngleHorizontalJoins(parent: SVGElement, start: Vector, targets: Vector[]): void {
        const totalTarget = targets.length;
        if (totalTarget === 0) return;

        for (let i = 0; i < totalTarget; i++) {
            const end = targets[i];

            const d = `M ${start.x} ${start.y} L ${start.x} ${end.y} L ${end.x} ${end.y}`;
            parent.insertBefore(DomHelper.svg('path', {
                class: "join-line",
                d: d,
            }), parent.firstChild);
        }
    }
}