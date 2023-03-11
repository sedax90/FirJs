import { Sequence } from "../components/sequence/sequence";
import { ComponentWithNode, Node } from "../models";

export class SequenceModifier {
    static move(sourceSequence: Sequence, component: ComponentWithNode, targetSequence: Sequence, targetIndex: number): void {
        const node = component.node;

        const sourceIndex = sourceSequence.nodes.indexOf(node);
        if (sourceIndex < 0) {
            throw new Error('Unknown step');
        }

        const isSameSequence = sourceSequence === targetSequence;
        if (isSameSequence && sourceIndex === targetIndex) {
            return; // Nothing to do.
        }

        sourceSequence.nodes.splice(sourceIndex, 1);
        if (isSameSequence && sourceIndex < targetIndex) {
            targetIndex--;
        }

        targetSequence.nodes.splice(targetIndex, 0, node);

        const context = targetSequence.context;
        if (context.onDefinitionChange) {
            context.onDefinitionChange(targetSequence.context.tree, true);
        }
    }

    static add(sequence: Sequence, component: ComponentWithNode, index: number): void {
        sequence.nodes.splice(index, 0, component.node);

        if (sequence.context.onDefinitionChange) {
            sequence.context.onDefinitionChange(sequence.context.tree, true);
        }
    }

    static remove(sequence: Sequence, component: ComponentWithNode): void {
        const index = sequence.nodes.findIndex(e => e.id === component.node.id);
        sequence.nodes.splice(index, 1);

        if (sequence.context.userDefinedListeners?.onNodeRemove) {
            sequence.context.userDefinedListeners.onNodeRemove({
                node: component.node,
                parent: null, // TODO
            });
        }

        if (sequence.context.onDefinitionChange) {
            sequence.context.onDefinitionChange(sequence.context.tree, true);
        }
    }
}