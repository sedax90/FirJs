import { ComponentInstance, Context, Node } from "../../models";
import { ClickEvent } from "../../utils/event-utils";
import { Sequence } from "../sequence/sequence";
import { PlaceholderView } from "./placeholder-view";

export class Placeholder implements ComponentInstance {
    private constructor(
        readonly view: PlaceholderView,
        readonly context: Context,
        readonly indexInSequence: number,
        readonly parentNode: Node | null,
    ) {
        context.designerState.selectedPlaceholder.subscribe(async (selectedPlaceholder) => {
            if (selectedPlaceholder === this) {
                this.setHover(true);

                this._node = context.designerState.draggedNode || context.designerState.selectedComponent.getValue()?.node;
                if (this._node) {
                    this.canDrop = await this._canDropNode(this._node);
                    this._setCanDrop(this.canDrop);
                }
                else {
                    this.setHover(false);
                    this._resetCanDrop();
                }
            }
            else {
                this.setHover(false);
                this._resetCanDrop();
            }
        });
    }

    parentSequence!: Sequence;
    canDrop: boolean = true;

    private _node!: Node | null | undefined;

    findByClick(click: ClickEvent): ComponentInstance | null {
        return null;
    }

    findById(nodeId: string): ComponentInstance | null {
        return null;
    }

    isHover(target: Element): ComponentInstance | null {
        return null;
    }

    static async create(parentElement: SVGElement, parentNode: Node | null, context: Context, index: number): Promise<Placeholder> {
        const view = await PlaceholderView.create(parentElement, index, context);
        const placeholder = new Placeholder(view, context, index, parentNode);
        context.designerState.placeholders?.push(placeholder);

        return placeholder;
    }

    show(): void {
        this.view.showPlaceholder();
    }

    hide(): void {
        this.view.hidePlaceholder();
    }

    setHover(hover: boolean): void {
        this.view.setHover(hover);
    }

    private _resetCanDrop(): void {
        this.view.resetCanDrop();
    }

    private _setCanDrop(value: boolean): void {
        this.view.setCanDrop(value);
    }

    private async _canDropNode(node: Node): Promise<boolean> {
        let canDrop = true;

        // Check if we are not dropping a terminator as latest
        let placeholderIsLast = false;
        let totalNodes = 0;
        if (this.parentSequence) {
            totalNodes = this.parentSequence.nodes.length;

            if (this.indexInSequence === totalNodes) {
                placeholderIsLast = true;
            }
        }

        if (node.type === 'terminator') {
            if (!placeholderIsLast && totalNodes > 0 || this.parentSequence.parentNode === null) {
                canDrop = false;
            }
        }

        // Check if previous node is a terminator
        if (canDrop) {
            const previousNodeIndex = this.indexInSequence - 1;
            if (previousNodeIndex >= 0) {
                const previousNode = this.parentSequence.nodes[previousNodeIndex];
                if (previousNode && previousNode.type === 'terminator') {
                    canDrop = false;
                }
            }
        }

        if (!canDrop) {
            this._setCanDrop(false);
            this.view.labelText = this.context.options.strings['placeholder.not-allowed-to-drop.label'];
            return canDrop;
        }
        else {
            if (this._node && this.context.userDefinedFunctions?.canDropNode) {
                const customValidationResult = await this.context.userDefinedFunctions.canDropNode({
                    node: this._node,
                    parent: this.parentNode,
                    index: this.indexInSequence,
                });

                canDrop = customValidationResult.allowed;
                if (!canDrop && customValidationResult.label) {
                    this.view.labelText = customValidationResult.label;
                }
            }
        }

        return canDrop;
    }
}