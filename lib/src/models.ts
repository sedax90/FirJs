import { ContextMenuView } from "./components/common/context-menu/context-menu-view";
import { Placeholder } from "./components/placeholder/placeholder";
import { Sequence } from "./components/sequence/sequence";
import { ComponentCreator } from "./utils/component-creator";
import { ClickEvent } from "./utils/event-utils";
import { Observable } from "./utils/observable";

export type FlowMode = 'vertical' | 'horizontal';

export interface ComponentWithView {
    view: ElementView;
}

export interface ComponentInstance extends ComponentWithView {
    view: ComponentView;
    context: Context;
    parentSequence: Sequence | null;
    indexInSequence: number;

    findByClick: (click: ClickEvent) => ComponentInstance | null;
    findById: (nodeId: string) => ComponentInstance | null;
    isHover: (target: Element) => ComponentInstance | null;
}

export interface ElementView {
    element: HTMLElement | SVGElement;
    parent?: HTMLElement | SVGElement;
}

export interface ComponentView extends ElementView {
    width: number;
    height: number;
    joinX: number;
    joinY: number;

    getSelectableElement: () => HTMLElement | SVGElement | null;
    setSelected?: (status: boolean) => void;
    setDragging?: (status: boolean) => void;
    setContextMenuOpened?: (status: boolean) => void;
    setHover?: (isHover: boolean) => void;
}

export type NodeType = 'choice' | 'map' | 'start' | 'end' | 'task' | 'terminator';

export interface Node {
    id: string;
    type: NodeType;

    label?: string;
    icon?: string;
    props?: NodeProps;
}

export interface NodeProps {
    [name: string]: unknown;
}

export interface MapProps extends NodeProps {
    children: Node[];
}

export interface ChoiceProps extends NodeProps {
    choices: Array<Node[]>;
}

export interface Vector {
    x: number;
    y: number;
}

export interface ComponentWithNode {
    node: Node;
    parentNode: Node | null;
}

interface PublicEventListeners {
    onNodeSelect?: (event: NodeSelectEvent) => void;
    onNodeDeselect?: (event: NodeDeselectEvent) => void;
    onNodeAdd?: (event: NodeAddEvent) => void;
    onNodeMove?: (event: NodeMoveEvent) => void;
    onNodeRemove?: (event: NodeRemoveEvent) => void;
    onNodeHover?: (event: NodeHoverEvent) => void;
    onNodeLeave?: (event: NodeLeaveEvent) => void;
    onWorkflowPan?: (event: WorkflowPanEvent) => void;
    onWorkflowScale?: (event: WorkflowScaleEvent) => void;
    onTreeChange?: (event: TreeChangeEvent) => void;
    onFlowModeChange?: (event: FlowModeChangeEvent) => void;
}

interface PublicFunctions {
    canRemoveNode?: (event: NodeRemoveRequestEvent) => Promise<boolean>;
    canAttachNode?: (event: NodeAttachEvent) => Promise<boolean>;
    canDropNode?: (event: NodeHoverEvent) => Promise<{
        allowed: boolean;
        label?: string;
    }>;
    canSelectNode?: (event: SelectNodeRequestEvent) => Promise<boolean>;
    canDeselectNode?: (event: DeselectNodeRequestEvent) => Promise<boolean>;
    hasError?: (event: HasErrorEvent) => Promise<boolean>;
}

interface PublicOverriders {
    overrideLabel?: (node: Node) => Promise<string>;
    overrideIcon?: (node: Node) => Promise<string | HTMLElement | SVGElement>;
    overrideColumnLabel?: (node: Node, parent: Node | null, columnIndex: number) => Promise<string>;
    overrideView?: OverrideViewMap;
    overrideComponentMethods?: OverrideComponentMethodsMap;
}

export interface OverrideViewMap {
    task?: (creationContext: TaskViewCreationContext, workspaceContext: Context) => Promise<ComponentView | null>;
    choice?: (creationContext: ChoiceViewCreationContext, workspaceContext: Context) => Promise<ComponentView | null>;
    map?: (creationContext: MapViewCreationContext, workspaceContext: Context) => Promise<ComponentView | null>;
    terminator?: (creationContext: TerminatorViewCreationContext, workspaceContext: Context) => Promise<ComponentView | null>;
}

interface PublicComponentInstanceOverridableFns {
    findByClick?: (componentInstance: ComponentInstance & ComponentWithNode) => ((click: ClickEvent, componentInstance: ComponentInstance & ComponentWithNode) => ComponentInstance | null) | null;
    findById?: (componentInstance: ComponentInstance & ComponentWithNode) => ((nodeId: string, componentInstance: ComponentInstance & ComponentWithNode) => ComponentInstance | null) | null;
    isHover?: (componentInstance: ComponentInstance & ComponentWithNode) => ((target: Element, componentInstance: ComponentInstance & ComponentWithNode) => ComponentInstance | null) | null;
};

export interface ComponentInstanceContext {
    view: ComponentView;
    node: Node;
    parentNode: Node | null;
    parentSequence: Sequence | null;
    indexInSequence: number;
}

export interface OverrideComponentMethodsMap {
    task?: PublicComponentInstanceOverridableFns,
    choice?: PublicComponentInstanceOverridableFns,
    map?: PublicComponentInstanceOverridableFns,
    terminator?: PublicComponentInstanceOverridableFns
}

interface ViewCreationContext {
    node: Node;
    parent: Node | null;
    parentElement: SVGElement | null;
}

export interface TaskViewCreationContext extends ViewCreationContext { }

export interface MapViewCreationContext extends ViewCreationContext { }

export interface ChoiceViewCreationContext extends ViewCreationContext { }

export interface TerminatorViewCreationContext extends ViewCreationContext { }

export interface WorkspaceStyleOptions {
    fontSize: string;
    fontFamily: string;
    placeholder: {
        width: number;
        height: number;
    }
}

export interface WorkspaceOptions {
    flowMode: FlowMode;
    style: WorkspaceStyleOptions;
    strings: Record<string, string>;
    infinite: boolean;
    events: {
        emitSelectedOnContextMenu: boolean;
    }
}

export interface WorkspaceInit extends PublicEventListeners, PublicFunctions, PublicOverriders {
    parent: HTMLElement;
    tree: Node[];
    options?: Partial<WorkspaceOptions>;
}

export interface Context {
    tree: Node[];
    designerState: DesignerState;
    options: WorkspaceOptions;

    userDefinedEventListeners?: PublicEventListeners;
    userDefinedFunctions?: PublicFunctions;
    userDefinedOverriders?: PublicOverriders;

    componentCreator: ComponentCreator;
}

export interface DesignerState {
    selectedComponent: Observable<ComponentWithNode | null>;
    selectedPlaceholder: Observable<Placeholder | null>;
    hoverComponent: Observable<ComponentWithNode | null>;
    contextMenuOpenedComponent: Observable<ComponentWithNode | null>;
    scale: number;
    flowMode: FlowMode;

    placeholders?: Placeholder[];
    draggedNode?: Node;
    /** @deprecated Use getWorkspaceRect() instead. */
    workspaceRect?: DOMRect;
    isDragging?: boolean;
    isPressingCtrl?: boolean;
    wasMoving?: boolean; // Set when a user move a node or the workflow.
    workflowPositionInWorkspace?: Vector;

    getWorkspaceRect: () => DOMRect;
}

export interface ClickInteraction {
    onStart(position: Vector): void;
    onMove(delta: Vector): ClickInteraction | void;
    onEnd(): void;
}

export interface WheelInteraction {
    onWheel(delta: number, mousePosition: Vector): void;
}

export interface KeyboardInteraction {
    onPress(e: KeyboardEvent): void;
    onRelease(e: KeyboardEvent): void;
}

interface GenericNodeEvent {
    node: Node;
    parent: Node | null;
}

export interface NodeSelectEvent extends GenericNodeEvent {
    index: number | null;
}

export interface NodeDeselectEvent extends GenericNodeEvent {
    index: number | null;
}

export interface NodeRemoveEvent extends GenericNodeEvent {
    index: number | null;
}

export interface NodeRemoveRequestEvent extends GenericNodeEvent {
    index: number | null;
}

export interface NodeAddEvent extends GenericNodeEvent {
    index: number | null;
}

export interface NodeMoveEvent extends GenericNodeEvent {
    previousParent: Node | null;
    previousIndex: number;
    currentIndex: number;
}

export interface NodeAttachEvent extends GenericNodeEvent {
    action: "add" | "move";
    index: number | null;
}

export interface NodeHoverEvent extends GenericNodeEvent {
    index: number | null;
}

export interface NodeLeaveEvent extends GenericNodeEvent {
    index: number | null;
}

export interface TreeChangeEvent {
    tree: Node[];
}

export interface SelectNodeRequestEvent extends GenericNodeEvent {
    index: number | null;
}

export interface DeselectNodeRequestEvent extends GenericNodeEvent {
    index: number | null;
}

export interface Attributes {
    [name: string]: string | number;
}

export interface ContextMenu {
    contextMenu: ContextMenuView;
}

export interface ContextMenuItem {
    label: string;
    action: (e: MouseEvent) => void;
    disabled?: boolean | (() => boolean);
}

export interface WorkflowPanEvent {
    position: Vector;
}

export interface WorkflowScaleEvent {
    scale: number;
}

export interface HasErrorEvent extends GenericNodeEvent { }

export interface FlowModeChangeEvent {
    flowMode: FlowMode;
}