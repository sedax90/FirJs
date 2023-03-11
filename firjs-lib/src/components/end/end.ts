import { Context } from "../../models";
import { ChildlessComponent } from "../childless/childless";
import { EndView } from "./end-view";

export class End extends ChildlessComponent {
    public static create(parent: SVGElement, context: Context): End {
        const view = EndView.create(parent);
        return new End(view, context);
    }
}