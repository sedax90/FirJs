import { Context, KeyboardInteraction } from "../models";
import { instanceOfComponentInstanc as instanceOfComponentInstance, instanceOfComponentWithNode } from "../utils/interface-utils";
import { delKey } from "../utils/keyboard-utils";
import { removeNode } from "../utils/node-utils";

export class DeleteKeyInteraction implements KeyboardInteraction {
    private constructor(
        readonly context: Context
    ) { }

    static create(context: Context): DeleteKeyInteraction {
        return new DeleteKeyInteraction(context);
    }

    onPress(e: KeyboardEvent): void {
        if (!delKey(e)) return;

        const componentWithNode = this.context.designerState.selectedNode.getValue();
        if (!componentWithNode) return;

        if (instanceOfComponentInstance(componentWithNode)) {
            removeNode(componentWithNode, this.context);
        }
    }

    onRelease(e: KeyboardEvent): void {
        // NOOP
    }

}