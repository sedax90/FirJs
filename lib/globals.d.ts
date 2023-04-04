import { NodeAddEvent, NodeMoveEvent, NodeRemoveEvent, TreeChangeEvent } from "./src";

export { }

declare global {
    interface HTMLElementEventMap {
        'treeChange': CustomEvent<TreeChangeEvent>;
        'nodeAdd': CustomEvent<NodeAddEvent>,
        'nodeMove': CustomEvent<NodeMoveEvent>,
        'nodeRemove': CustomEvent<NodeRemoveEvent>,
    }
}