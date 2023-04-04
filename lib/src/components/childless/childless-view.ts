import { ComponentView } from "../../models";

export class ChildlessComponentView implements ComponentView {
    public constructor(
        readonly element: SVGElement,
        readonly parent: SVGElement,
        readonly width: number,
        readonly height: number,
        readonly joinX: number,
    ) { }

}