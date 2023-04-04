import { ComponentInstance, ComponentView, Context, Node } from "../../models";
import { ClickEvent } from "../../utils/event-utils";
import { Sequence } from "../sequence/sequence";

export abstract class ParentComponent implements ComponentInstance {
    constructor(
        readonly view: ComponentView,
        readonly sequence: Sequence,
        readonly children: Node[],
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

    findByClick(click: ClickEvent): ComponentInstance | null {
        // Check children
        const child = this.sequence.findByClick(click);
        if (child) {
            return child;
        }

        // If no children check if is current view
        const viewContains = this.view.element.contains(click.target);
        if (viewContains) {
            return this;
        }

        return null;
    }
}