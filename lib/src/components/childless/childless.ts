import { ComponentInstance, ComponentView, Context, Node } from "../../models";
import { ClickEvent } from "../../utils/event-utils";
import { Sequence } from "../sequence/sequence";

export abstract class ChildlessComponent implements ComponentInstance {
    constructor(
        readonly view: ComponentView,
        readonly context: Context,
    ) {
        context.designerState?.selectedComponent.subscribe(
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
            }
        );

        context.designerState?.hoverComponent.subscribe(
            (data) => {
                if (data && data === this) {
                    if (this.view.setHover) {
                        this.view.setHover(true);
                    }
                }
                else {
                    if (this.view.setHover) {
                        this.view.setHover(false);
                    }
                }
            }
        );
    }

    node!: Node;
    parentNode!: Node | null;
    parentSequence!: Sequence | null;
    indexInSequence!: number;

    findByClick(click: ClickEvent): ComponentInstance | null {
        const viewContains = this.view.getSelectableElement()?.contains(click.target);
        if (viewContains) {
            return this;
        }

        return null;
    }

    findById(nodeId: string): ComponentInstance | null {
        if (this.node && this.node.id === nodeId) return this;

        return null;
    }

    isHover(target: Element): ComponentInstance | null {
        const viewContains = this.view.getSelectableElement()?.contains(target);
        if (viewContains) {
            return this;
        }

        return null;
    }
}