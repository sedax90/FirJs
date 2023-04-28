import { ComponentView } from "../../models";
import { Sequence } from "../sequence/sequence";

export class NodeTreeView implements ComponentView {
    public constructor(
        readonly element: SVGElement,
        readonly parent: SVGElement,
        readonly width: number,
        readonly height: number,
        readonly joinX: number,
        readonly joinY: number,
        readonly childSequences: Sequence[],
    ) { }

    selectableElement!: SVGElement;

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
        return this.selectableElement;
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