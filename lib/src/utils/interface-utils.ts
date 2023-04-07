import { ComponentInstance, ComponentWithNode, Node } from "../models";

export function instanceOfComponentWithNode(value: any): value is ComponentWithNode {
    if (typeof value !== 'object') return false;

    return 'node' in value && instanceOfSequenceNode(value.node);
}

export function instanceOfSequenceNode(value: any): value is Node {
    if (typeof value !== 'object') return false;

    return 'id' in value && 'type' in value;
}

export function instanceOfComponentInstance(value: any): value is ComponentInstance {
    if (typeof value !== 'object') return false;

    return 'view' in value && 'context' in value && 'parentSequence' in value;
}