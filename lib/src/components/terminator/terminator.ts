import { ComponentWithNode, Context, Node } from "../../models";
import { ChildlessComponent } from "../childless/childless";
import { TerminatorView } from "./terminator-view";

export class Terminator extends ChildlessComponent implements ComponentWithNode {

    static async create(parentElement: SVGElement, node: Node, parentNode: Node | null, context: Context): Promise<Terminator> {
        const view = await TerminatorView.create(parentElement, node, context);
        const terminator = new Terminator(view, context);

        terminator.node = node;
        terminator.parentNode = parentNode;

        return terminator;
    }
}