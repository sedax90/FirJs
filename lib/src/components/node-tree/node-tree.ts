import { ComponentInstance, ComponentWithNode, Context, Node } from "../../models";
import { ClickEvent } from "../../utils/event-utils";
import { Sequence } from "../sequence/sequence";
import { NodeTreeView } from "./node-tree-view";

export class NodeTree implements ComponentWithNode {
    constructor(
        readonly view: NodeTreeView,
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

        const selectableElement = view.getSelectableElement();
        if (selectableElement) {
            selectableElement.addEventListener('mouseover', () => {
                context.designerState.hoverComponent.next(this);
            });

            selectableElement.addEventListener('mouseleave', () => {
                context.designerState.hoverComponent.next(null);
            });
        }
    }

    node!: Node;
    parentNode!: Node | null;
    parentSequence!: Sequence | null;
    indexInSequence!: number;

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
        const viewContains = this.view.getSelectableElement()?.contains(click.target);
        if (viewContains) {
            return this;
        }

        return null;
    }

    findById(nodeId: string): ComponentInstance | null {
        const sequences = this.view.childSequences;
        for (const sequence of sequences) {
            const component = sequence.findById(nodeId);
            if (component) {
                return component;
            }
        }

        if (this.node && this.node.id === nodeId) {
            return this;
        }

        return null;
    }
}