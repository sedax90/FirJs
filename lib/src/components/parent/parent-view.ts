import { ComponentView } from "../../models";
import { Sequence } from "../sequence/sequence";

export abstract class ParentView implements ComponentView {
    constructor(
        readonly element: SVGElement,
        readonly parent: SVGElement,
        readonly width: number,
        readonly height: number,
        readonly joinX: number,
        readonly sequence: Sequence,
    ) { }


    abstract getSelectableElement(): HTMLElement | SVGElement | null;
}