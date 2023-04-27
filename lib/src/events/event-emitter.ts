import { FlowModeChangeEvent, NodeAddEvent, NodeDeselectEvent, NodeHoverEvent, NodeLeaveEvent, NodeMoveEvent, NodeRemoveEvent, NodeSelectEvent, TreeChangeEvent, WorkflowPanEvent, WorkflowScaleEvent } from "../models";
import { EventSuppressor } from "./event-suppressor";

export class EventEmitter {
    static emitTreeChangeEvent(element: EventTarget, data: TreeChangeEvent): void {
        if (EventEmitter._suppressEvent('treeChange')) return;
        element.dispatchEvent(EventEmitter.createCustomEvent("treeChange", data));
    }

    static emitNodeMoveEvent(element: EventTarget, data: NodeMoveEvent): void {
        if (EventEmitter._suppressEvent('nodeMove')) return;
        element.dispatchEvent(EventEmitter.createCustomEvent("nodeMove", data));
    }

    static emitNodeAddEvent(element: EventTarget, data: NodeAddEvent): void {
        if (EventEmitter._suppressEvent('nodeAdd')) return;
        element.dispatchEvent(EventEmitter.createCustomEvent('nodeAdd', data));
    }

    static emitNodeRemoveEvent(element: EventTarget, data: NodeRemoveEvent): void {
        if (EventEmitter._suppressEvent('nodeRemove')) return;
        element.dispatchEvent(EventEmitter.createCustomEvent('nodeRemove', data));
    }

    static emitWorkflowPanEvent(element: EventTarget, data: WorkflowPanEvent): void {
        if (EventEmitter._suppressEvent('workflowPan')) return;
        element.dispatchEvent(EventEmitter.createCustomEvent('workflowPan', data));
    }

    static emitWorkflowScaleEvent(element: EventTarget, data: WorkflowScaleEvent): void {
        if (EventEmitter._suppressEvent('workflowScale')) return;
        element.dispatchEvent(EventEmitter.createCustomEvent('workflowScale', data));
    }

    static emitNodeSelectEvent(element: EventTarget, data: NodeSelectEvent): void {
        if (EventEmitter._suppressEvent('nodeSelect')) return;
        element.dispatchEvent(EventEmitter.createCustomEvent('nodeSelect', data));
    }

    static emitNodeDeselectEvent(element: EventTarget, data: NodeDeselectEvent): void {
        if (EventEmitter._suppressEvent('nodeDeselect')) return;
        element.dispatchEvent(EventEmitter.createCustomEvent('nodeDeselect', data));
    }

    static emitFlowModeChangeEvent(element: EventTarget, data: FlowModeChangeEvent): void {
        if (EventEmitter._suppressEvent('flowModeChange')) return;
        element.dispatchEvent(EventEmitter.createCustomEvent('flowModeChange', data));
    }

    static emitNodeHoverEvent(element: EventTarget, data: NodeHoverEvent): void {
        if (EventEmitter._suppressEvent('nodeHover')) return;
        element.dispatchEvent(EventEmitter.createCustomEvent('nodeHover', data));
    }

    static emitNodeLeaveEvent(element: EventTarget, data: NodeLeaveEvent): void {
        if (EventEmitter._suppressEvent('nodeLeave')) return;
        element.dispatchEvent(EventEmitter.createCustomEvent('nodeLeave', data));
    }

    private static createCustomEvent(name: string, data: unknown): CustomEvent {
        return new CustomEvent(name, {
            detail: data,
            bubbles: true,
            composed: true,
            cancelable: true,
        });
    }

    private static _suppressEvent(event: keyof HTMLElementEventMap): boolean {
        const eventSuppressor = EventSuppressor.getInstance();
        const suppressed = eventSuppressor.contains(event);
        eventSuppressor.release(event);
        return suppressed;
    }
}