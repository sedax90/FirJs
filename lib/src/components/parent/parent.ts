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

        context.designerState?.contextMenuOpenedComponent.subscribe(
            (data) => {
                if (data && data === this) {
                    if (this.view.setContextMenuOpened) {
                        this.view.setContextMenuOpened(true);
                    }
                }
                else {
                    if (this.view.setContextMenuOpened) {
                        this.view.setContextMenuOpened(false);
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
        // Check children
        const child = this.sequence.findByClick(click);
        if (child) {
            return child;
        }

        // If no children check if is current view
        const viewContains = this.view.getSelectableElement()?.contains(click.target);
        if (viewContains) {
            return this;
        }

        return null;
    }

    findById(nodeId: string): ComponentInstance | null {
        const child = this.sequence.findById(nodeId);
        if (child) {
            return child;
        }

        if (this.node && this.node.id === nodeId) {
            return this;
        }

        return null;
    }

    isHover(target: Element): ComponentInstance | null {
        const child = this.sequence.isHover(target);
        if (child) {
            return child;
        }

        const viewContains = this.view.getSelectableElement()?.contains(target);
        if (viewContains) {
            return this;
        }

        return null;
    }
}