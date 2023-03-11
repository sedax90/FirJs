import { ComponentView } from "../../models";
import { Sequence } from "../sequence/sequence";

export class ParentView implements ComponentView {
    public constructor(
        readonly element: SVGElement,
        readonly parent: SVGElement,
        readonly width: number,
        readonly height: number,
        readonly joinX: number,
        readonly sequence: Sequence,
    ) { }
}