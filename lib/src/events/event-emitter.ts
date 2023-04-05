import { NodeAddEvent, NodeDeselectEvent, NodeMoveEvent, NodeRemoveEvent, NodeSelectEvent, TreeChangeEvent, WorkflowPanEvent, WorkflowScaleEvent } from "../models";

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

    static emitWorkflowPanEvent(element: EventTarget, data: WorkflowPanEvent): void {
        element.dispatchEvent(EventEmitter.createCustomEvent('workflowPan', data));
    }

    static emitWorkflowScaleEvent(element: EventTarget, data: WorkflowScaleEvent): void {
        element.dispatchEvent(EventEmitter.createCustomEvent('workflowScale', data));
    }

    static emitNodeSelectEvent(element: EventTarget, data: NodeSelectEvent): void {
        element.dispatchEvent(EventEmitter.createCustomEvent('nodeSelect', data));
    }

    static emitNodeDeselectEvent(element: EventTarget, data: NodeDeselectEvent): void {
        element.dispatchEvent(EventEmitter.createCustomEvent('nodeDeselect', data));
    }

    private static createCustomEvent(name: string, data: unknown): CustomEvent {
        return new CustomEvent(name, {
            detail: data,
            bubbles: true,
            composed: true,
            cancelable: true,
        });
    }
}