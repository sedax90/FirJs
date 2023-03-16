import { ComponentInstance, Context, Node, NodeRemoveRequestEvent } from "../models";
import { instanceOfComponentWithNode } from "./interface-utils";
import { SequenceModifier } from "./sequence-modifier";

export function getNodeClasses(node: Node): string[] {
    return [
        `node-${node.id}`,
        `node--type-${node.type}`,
    ];
}

export function removeNode(componentInstance: ComponentInstance, context: Context): void {
    if (instanceOfComponentWithNode(componentInstance)) {
        const sequence = componentInstance.parentSequence;
        if (!sequence?.nodes) return;

        if (context.userDefinedListeners?.canRemoveNode) {
            const event: NodeRemoveRequestEvent = {
                node: componentInstance.node,
                parent: componentInstance.parentNode,
            };
            context.userDefinedListeners.canRemoveNode(event).then(
                (result) => {
                    if (result === true) {
                        SequenceModifier.remove(sequence, componentInstance);
                    }
                }
            );
        }
        else {
            SequenceModifier.remove(sequence, componentInstance);
        }
    }
}

export function duplicateNode(componentInstance: ComponentInstance): void {
    if (instanceOfComponentWithNode(componentInstance)) {
        const sequence = componentInstance.parentSequence;
        if (!sequence?.nodes) return;

        const index = sequence.getNodeIndex(componentInstance.node);
        if (index >= 0) {
            const clone = {
                ...componentInstance,
                node: {
                    ...componentInstance.node,
                    id: componentInstance.node.id + '-clone',
                }
            };
            SequenceModifier.add(sequence, clone, index + 1);
        }
    }
}