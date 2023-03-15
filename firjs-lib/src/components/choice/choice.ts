import { ComponentInstance, ComponentWithNode, Context, Node } from "../../models";
import { ClickEvent } from "../../utils/event-utils";
import { Sequence } from "../sequence/sequence";
import { ChoiceView } from "./choice-view";

export class Choice implements ComponentWithNode {
    constructor(
        readonly view: ChoiceView,
        readonly context: Context,
    ) {
        context.designerState?.selectedNode.subscribe(
            (data) => {
                if (data && data === this) {
                    if (this.view.setSelected) {
                        this.view.setSelected(true);
                    }
                }
                else {
                    if (this.view.setSelected) {
                        this.view.setSelected(false);
                    }
                }
            });
    }

    node!: Node;
    parentNode!: Node | null;
    parentSequence!: Sequence | null;

    public static async create(parentElement: SVGElement, node: Node, parentNode: Node | null, context: Context): Promise<Choice> {
        const view = await ChoiceView.create(parentElement, node, context);
        const choice = new Choice(view, context);

        choice.node = node;
        choice.parentNode = parentNode;

        return choice;
    }

    findByClick(click: ClickEvent): ComponentInstance | null {
        // Check children
        const sequences = this.view.childSequences;
        for (const sequence of sequences) {
            const component = sequence.findByClick(click);
            if (component) {
                return component;
            }
        }

        // If no children check if is current view
        const viewContains = this.view.element.contains(click.target);
        if (viewContains) {
            return this;
        }

        return null;
    }
}