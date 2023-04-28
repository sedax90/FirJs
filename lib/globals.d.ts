import { FlowModeChangeEvent, NodeAddEvent, NodeDeselectEvent, NodeHoverEvent, NodeMoveEvent, NodeRemoveEvent, NodeSelectEvent, TreeChangeEvent, WorkflowPanEvent, WorkflowScaleEvent as WorkflowScaleEvent } from "./src";

export { }

declare global {
    interface HTMLElementEventMap {
        'treeChange': CustomEvent<TreeChangeEvent>;
        'nodeAdd': CustomEvent<NodeAddEvent>,
        'nodeMove': CustomEvent<NodeMoveEvent>,
        'nodeRemove': CustomEvent<NodeRemoveEvent>,
        'nodeSelect': CustomEvent<NodeSelectEvent>,
        'nodeDeselect': CustomEvent<NodeDeselectEvent>,
        'workflowPan': CustomEvent<WorkflowPanEvent>,
        'workflowScale': CustomEvent<WorkflowScaleEvent>,
        'flowModeChange': CustomEvent<FlowModeChangeEvent>,
        'nodeHover': CustomEvent<NodeHoverEvent>,
        'nodeLeave': CustomEvent<NodeHoverEvent>,
    }
}