import { Placeholder } from "../components/placeholder/placeholder";
import { ClickInteraction, Context, Node, NodeAttachEvent, Vector } from "../models";
import { PlaceholderFinder } from "../utils/placeholder-finder";
import { SequenceModifier } from "../utils/sequence-modifier";
import { subtract } from "../utils/vector-utils";

export class DragExternalInteraction implements ClickInteraction {

    private constructor(
        readonly element: HTMLElement | SVGElement,
        readonly context: Context,
        readonly placeholderFinder: PlaceholderFinder,
    ) { }

    private _mouseClickOffsetFromComponent!: Vector;
    private _startPosition!: Vector;
    // private _currentPlaceholder: Placeholder | null = null;

    static create(element: HTMLElement | SVGElement, context: Context): DragExternalInteraction {
        const placeholderFinder = PlaceholderFinder.create(context.designerState?.placeholders ? context.designerState.placeholders : []);
        return new DragExternalInteraction(element, context, placeholderFinder);
    }

    onStart(startMousePosition: Vector): void {
        this._startPosition = startMousePosition;

        const componentRect = this.element.getBoundingClientRect();
        this._mouseClickOffsetFromComponent = subtract(startMousePosition, {
            x: componentRect.x,
            y: componentRect.y,
        });

        if (this.context.designerState.placeholders) {
            for (const placeholder of this.context.designerState.placeholders) {
                placeholder.show();
            }
        }
    }

    onMove(delta: Vector): void | ClickInteraction {
        let newPosition = subtract(this._startPosition, delta);
        newPosition = subtract(newPosition, this._mouseClickOffsetFromComponent);

        // We must compensate the element position with the workspace offset
        const workspaceRect = this.context.designerState.workspaceRect;
        if (workspaceRect) {
            newPosition.x = newPosition.x - workspaceRect.left;
            newPosition.y = newPosition.y - workspaceRect.top;
        }

        const elementRect = this.element.getBoundingClientRect();

        const placeholder = this.placeholderFinder.findByPosition(newPosition, elementRect.width, elementRect.height);

        // This is a workaround for the dragend event because when you are dragging an HtmlElement and you release the mouse a last drag event is emitted before dragend and it could override the placeholder value.
        setTimeout(() => {
            // let canDropNode = true;

            // const node = this.context.designerState.tempNodeToDrop;
            // if (placeholder && node) {
            //     canDropNode = placeholder.canDropNode(node);
            // }

            // if (placeholder) {
            //     if (this._currentPlaceholder) {
            //         this._currentPlaceholder.resetState();
            //     }

            //     if (canDropNode) {
            //         this._currentPlaceholder = placeholder;
            //         this._currentPlaceholder.setHover(true);
            //         this._currentPlaceholder.setCanDrop(true);
            //     }
            //     else {
            //         placeholder.setHover(true);
            //     }
            // }
            // else {
            //     if (this._currentPlaceholder) {
            //         this._currentPlaceholder.resetState();
            //     }

            //     this._currentPlaceholder = null;
            // }

            this.context.designerState.selectedPlaceholder.next(placeholder);
        }, 5);
    }

    onEnd(): void {
        const currentPlaceholder = this.context.designerState.selectedPlaceholder.getValue();
        const draggedNode = this.context.designerState.draggedNode;

        if (currentPlaceholder && currentPlaceholder.canDrop && draggedNode) {
            const canAttachNodeFn = this.context.userDefinedFunctions?.canAttachNode;
            if (canAttachNodeFn) {
                const event: NodeAttachEvent = {
                    node: draggedNode,
                    parent: null,
                    action: "add",
                };
                canAttachNodeFn(event).then(
                    (result) => {
                        if (result === true) {
                            this._attachNode(currentPlaceholder, draggedNode);
                        }
                    }
                );
            }
            else {
                this._attachNode(currentPlaceholder, draggedNode);
            }
        }

        if (this.context.designerState.placeholders) {
            for (const placeholder of this.context.designerState.placeholders) {
                placeholder.hide();
            }
        }

        this.context.designerState.draggedNode = undefined;
        this.context.designerState.selectedPlaceholder.next(null);
    }

    private _attachNode(placeholder: Placeholder, node: Node): void {
        const targetSequence = placeholder.parentSequence;
        SequenceModifier.add(targetSequence, {
            node: node,
            parentNode: targetSequence.parentNode,
        }, placeholder.index);
    }
}