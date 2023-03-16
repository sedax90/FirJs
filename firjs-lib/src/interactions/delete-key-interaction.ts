import { Context, KeyboardInteraction } from "../models";
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

        const componentInstance = this.context.designerState.selectedNode.getValue();
        if (!componentInstance) return;
        removeNode(componentInstance, this.context);
    }

    onRelease(e: KeyboardEvent): void {
        // NOOP
    }

}