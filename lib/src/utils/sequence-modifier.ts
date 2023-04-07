import { Sequence } from "../components/sequence/sequence";
import { ComponentWithNode } from "../models";
import { EventEmitter } from "../events/event-emitter";
import { instanceOfComponentInstance } from "./interface-utils";

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

        EventEmitter.emitNodeMoveEvent(targetSequence.view.element, {
            node: component.node,
            parent: component.parentNode,
            previousParent: sourceSequence.parentNode,
            previousIndex: sourceIndex,
            currentIndex: targetIndex,
        });
    }

    static add(sequence: Sequence, component: ComponentWithNode, index: number): void {
        sequence.nodes.splice(index, 0, component.node);

        EventEmitter.emitNodeAddEvent(sequence.view.element, {
            node: component.node,
            parent: component.parentNode,
            index: instanceOfComponentInstance(component) ? component.indexInSequence : null,
        });
    }

    static remove(sequence: Sequence, component: ComponentWithNode): void {
        const index = sequence.nodes.findIndex(e => e.id === component.node.id);
        sequence.nodes.splice(index, 1);

        EventEmitter.emitNodeRemoveEvent(sequence.view.element, {
            node: component.node,
            parent: sequence.parentNode,
            index: instanceOfComponentInstance(component) ? component.indexInSequence : -1,
        });
    }
}