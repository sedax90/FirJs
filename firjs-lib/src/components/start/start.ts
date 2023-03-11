import { Context } from "../../models";
import { ChildlessComponent } from "../childless/childless";
import { StartView } from "./start-view";

export class Start extends ChildlessComponent {
    static create(parent: SVGElement, context: Context): Start {
        const view = StartView.create(parent, context);
        return new Start(view, context);
    }
}