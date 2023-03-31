import { Placeholder } from "../components/placeholder/placeholder";
import { ClickInteraction, Context, Node, NodeDropEvent, Vector } from "../models";
import { getElementPositionInWorkspace } from "../utils/component-position-utils";
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
    private _currentPlaceholder: Placeholder | null = null;

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
            if (placeholder) {
                if (this._currentPlaceholder) {
                    this._currentPlaceholder.setIsHover(false);
                    this._currentPlaceholder = placeholder;
                }
                else {
                    this._currentPlaceholder = placeholder;
                }

                this._currentPlaceholder.setIsHover(true);
            }
            else {
                if (this._currentPlaceholder) {
                    this._currentPlaceholder.setIsHover(false);
                }

                this._currentPlaceholder = null;
            }
        }, 5);
    }

    onEnd(): void {
        const currentPlaceholder = this._currentPlaceholder;
        const tempNodeToDrop = this.context.designerState.tempNodeToDrop;

        if (currentPlaceholder && tempNodeToDrop) {
            const canDropNodeFn = this.context.userDefinedListeners?.canDropNode;
            if (canDropNodeFn) {
                const event: NodeDropEvent = {
                    node: tempNodeToDrop,
                    parent: null,
                    action: "add",
                };
                canDropNodeFn(event).then(
                    (result) => {
                        if (result === true) {
                            this._dropNode(currentPlaceholder, tempNodeToDrop);
                        }
                    }
                );
            }
            else {
                this._dropNode(currentPlaceholder, tempNodeToDrop);
            }
        }

        if (this.context.designerState.placeholders) {
            for (const placeholder of this.context.designerState.placeholders) {
                placeholder.hide();
            }
        }
    }

    private _dropNode(placeholder: Placeholder, node: Node): void {
        const targetSequence = placeholder.parentSequence;
        SequenceModifier.add(targetSequence, {
            node: node,
            parentNode: targetSequence.parentNode,
        }, placeholder.index);
    }
}