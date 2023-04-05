import { NodeAddEvent, NodeMoveEvent, NodeRemoveEvent, TreeChangeEvent, WorkflowPanEvent, WorkflowScaleEvent as WorkflowScaleEvent } from "./src";

export { }

declare global {
    interface HTMLElementEventMap {
        'treeChange': CustomEvent<TreeChangeEvent>;
        'nodeAdd': CustomEvent<NodeAddEvent>,
        'nodeMove': CustomEvent<NodeMoveEvent>,
        'nodeRemove': CustomEvent<NodeRemoveEvent>,
        'workflowPan': CustomEvent<WorkflowPanEvent>,
        'workflowScale': CustomEvent<WorkflowScaleEvent>,
    }
}