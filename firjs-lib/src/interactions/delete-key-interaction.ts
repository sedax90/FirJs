import { Context, KeyboardInteraction } from "../models";
import { instanceOfComponentWithNode } from "../utils/interface-utils";
import { delKey } from "../utils/keyboard-utils";
import { SequenceModifier } from "../utils/sequence-modifier";

export class DeleteKeyInteraction implements KeyboardInteraction {
    private constructor(
        readonly context: Context
    ) { }

    static create(context: Context): DeleteKeyInteraction {
        return new DeleteKeyInteraction(context);
    }

    onPress(e: KeyboardEvent): void {
        if (!delKey(e)) return;

        const componentNode = this.context.designerState.selectedNode.getValue();
        if (!componentNode) return;

        if (instanceOfComponentWithNode(componentNode)) {
            const sequence = componentNode.parentSequence;
            if (!sequence?.nodes) return;

            if (this.context.userDefinedListeners?.onNodeRemoveRequest) {
                this.context.userDefinedListeners.onNodeRemoveRequest({
                    node: componentNode.node,
                    parent: componentNode.parentNode,
                });
            }
            else {
                SequenceModifier.remove(sequence, componentNode);
            }
        }
    }

    onRelease(e: KeyboardEvent): void {
        // NOOP
    }

}