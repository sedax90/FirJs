import { Context, Node } from "../../models";
import { NodeTree } from "../node-tree/node-tree";
import { ChoiceView } from "./choice-view";

export class Choice extends NodeTree {
    public static async create(parentElement: SVGElement, node: Node, parentNode: Node | null, context: Context): Promise<Choice> {
        const view = await ChoiceView.create(parentElement, node, parentNode, context);
        const choice = new Choice(view, context);

        choice.node = node;
        choice.parentNode = parentNode;

        return choice;
    }
}