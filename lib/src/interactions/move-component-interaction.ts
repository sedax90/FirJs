import { Placeholder } from "../components/placeholder/placeholder";
import { ComponentInstance, Context, ClickInteraction, Vector } from "../models";
import { getComponentPositionInWorkspace } from "../utils/component-position-utils";
import { instanceOfComponentWithNode } from "../utils/interface-utils";
import { PlaceholderFinder } from "../utils/placeholder-finder";
import { SequenceModifier } from "../utils/sequence-modifier";
import { subtract } from "../utils/vector-utils";
import { DragView } from "./drag-view";

export class MoveComponentInteraction implements ClickInteraction {
    private constructor(
        readonly dragView: DragView,
        readonly draggedComponent: ComponentInstance,
        readonly placeholderFinder: PlaceholderFinder,
        readonly context: Context,
    ) { }

    private _startPosition!: Vector;
    private _mouseClickOffsetFromComponent!: Vector;
    // private _currentPlaceholder: Placeholder | null = null;
    private _dragEnded: boolean = false;

    static create(
        componentInstance: ComponentInstance,
        context: Context,
    ): MoveComponentInteraction {
        const dragView = DragView.create(componentInstance, context);
        const placeholderFinder = PlaceholderFinder.create(context.designerState?.placeholders ? context.designerState.placeholders : []);
        return new MoveComponentInteraction(dragView, componentInstance, placeholderFinder, context);
    }

    onStart(startMousePosition: Vector): void {
        this._startPosition = startMousePosition;

        if (this.draggedComponent) {
            const componentPosition = getComponentPositionInWorkspace(this.draggedComponent);
            this._mouseClickOffsetFromComponent = subtract(startMousePosition, {
                x: componentPosition.x,
                y: componentPosition.y,
            });
        } else {
            this._mouseClickOffsetFromComponent = {
                x: this.dragView.element.clientWidth / 2,
                y: this.dragView.element.clientHeight / 2
            };
        }

        const placeholders = this.context.designerState.placeholders;
        if (placeholders) {
            for (const placeholder of placeholders) {
                if (this.draggedComponent.view.element.contains(placeholder.view.element)) continue;

                placeholder.show();
            }
        }

        // Force terminate drag on Escape
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this._terminateDrag();
                return;
            }
        });
    }

    onMove(delta: Vector): void | ClickInteraction {
        let newPosition = subtract(this._startPosition, delta);
        newPosition = subtract(newPosition, this._mouseClickOffsetFromComponent);

        this.dragView.element.style.left = newPosition.x + "px";
        this.dragView.element.style.top = newPosition.y + "px";

        const placeholder = this.placeholderFinder.findByPosition(newPosition, this.draggedComponent.view.width, this.draggedComponent.view.height);

        // const placeholderIsAChildOfDraggedComponent = placeholder && this.draggedComponent.view.element.contains(placeholder.view.element);
        // if (placeholder && !placeholderIsAChildOfDraggedComponent) {
        //     if (this._currentPlaceholder) {
        //         this._currentPlaceholder._setHover(false);
        //         this._currentPlaceholder = placeholder;
        //     }
        //     else {
        //         this._currentPlaceholder = placeholder;
        //     }

        //     this._currentPlaceholder._setHover(true);
        // }
        // else {
        //     if (this._currentPlaceholder) {
        //         this._currentPlaceholder._setHover(false);
        //     }

        //     this._currentPlaceholder = null;
        // }

        this.context.designerState.selectedPlaceholder.next(placeholder);
    }

    onEnd(): void {
        if (this._dragEnded) return;

        const currentPlaceholder = this.context.designerState.selectedPlaceholder.getValue();

        if (currentPlaceholder && currentPlaceholder.canDrop && instanceOfComponentWithNode(this.draggedComponent)) {
            const sourceSequence = this.draggedComponent.parentSequence;
            const targetSequence = currentPlaceholder.parentSequence;

            // Check if we are going to put a sequence inside a child of it
            if (this.draggedComponent.view.element.contains(targetSequence.view.element)) {
                this._terminateDrag();
                return;
            }

            if (sourceSequence && targetSequence) {
                const canAttachNodeFn = this.context.userDefinedFunctions?.canAttachNode;
                const currentPlaceholderIndex = currentPlaceholder.index;
                const draggedComponent = this.draggedComponent;

                if (canAttachNodeFn) {
                    canAttachNodeFn({
                        node: this.draggedComponent.node,
                        parent: this.draggedComponent.parentNode,
                        action: "move",
                    }).then(
                        (result) => {
                            if (result === true) {
                                SequenceModifier.move(sourceSequence, draggedComponent, targetSequence, currentPlaceholderIndex);
                            }
                        }
                    );
                }
                else {
                    SequenceModifier.move(sourceSequence, draggedComponent, targetSequence, currentPlaceholderIndex);
                }
            }
        }

        this._terminateDrag();
    }

    private _terminateDrag(): void {
        if (this.draggedComponent.view.setDragging) {
            this.draggedComponent.view.setDragging(false);
        }

        if (this.context.designerState.placeholders) {
            for (const placeholder of this.context.designerState.placeholders) {
                placeholder.hide();
            }
        }

        this.context.designerState.selectedPlaceholder.next(null);

        this.dragView.destroy();
        this._dragEnded = true;
    }
}