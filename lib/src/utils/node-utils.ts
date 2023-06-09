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

        if (context.userDefinedFunctions?.canRemoveNode) {
            const event: NodeRemoveRequestEvent = {
                node: componentInstance.node,
                parent: componentInstance.parentNode,
                index: componentInstance.indexInSequence,
            };
            context.userDefinedFunctions.canRemoveNode(event).then(
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