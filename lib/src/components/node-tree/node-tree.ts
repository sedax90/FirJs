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
        // Method overrider
        const methodsOverride = this.context.userDefinedOverriders?.overrideComponentMethods?.choice?.findByClick;
        if (methodsOverride) {
            const overridedFn = methodsOverride(this);
            if (overridedFn) {
                return overridedFn(click, this);
            }
        }

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
        // Method overrider
        const methodsOverride = this.context.userDefinedOverriders?.overrideComponentMethods?.choice?.findById;
        if (methodsOverride) {
            const overridedFn = methodsOverride(this);
            if (overridedFn) {
                return overridedFn(nodeId, this);
            }
        }

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

    isHover(target: Element): ComponentInstance | null {
        // Method overrider
        const methodsOverride = this.context.userDefinedOverriders?.overrideComponentMethods?.choice?.isHover;
        if (methodsOverride) {
            const overridedFn = methodsOverride(this);
            if (overridedFn) {
                return overridedFn(target, this);
            }
        }

        const sequences = this.view.childSequences;
        for (const sequence of sequences) {
            const component = sequence.isHover(target);
            if (component) {
                return component;
            }
        }

        // If no children check if is current view
        const viewContains = this.view.getSelectableElement()?.contains(target);
        if (viewContains) {
            return this;
        }

        return null;
    }
}