import { NodeAddEvent, NodeMoveEvent, NodeRemoveEvent, TreeChangeEvent } from "../models";

export class EventEmitter {
    static emitTreeChangeEvent(element: EventTarget, data: TreeChangeEvent): void {
        element.dispatchEvent(EventEmitter.createCustomEvent("treeChange", data));
    }

    static emitNodeMoveEvent(element: EventTarget, data: NodeMoveEvent): void {
        element.dispatchEvent(EventEmitter.createCustomEvent("nodeMove", data));
    }

    static emitNodeAddEvent(element: EventTarget, data: NodeAddEvent): void {
        element.dispatchEvent(EventEmitter.createCustomEvent('nodeAdd', data));
    }

    static emitNodeRemoveEvent(element: EventTarget, data: NodeRemoveEvent): void {
        element.dispatchEvent(EventEmitter.createCustomEvent('nodeRemove', data));
    }

    private static createCustomEvent(name: string, data: unknown): CustomEvent {
        return new CustomEvent(name, {
            detail: data,
            bubbles: true,
            composed: true,
            cancelable: false,
        });
    }
}