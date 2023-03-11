import { ComponentInstance, ComponentView, Context, Node } from "../../models";
import { ClickEvent } from "../../utils/event-utils";
import { Sequence } from "../sequence/sequence";

export abstract class ChildlessComponent implements ComponentInstance {
    constructor(
        readonly view: ComponentView,
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
        const viewContains = this.view.element.contains(click.target);
        if (viewContains) {
            return this;
        }

        return null;
    }
}