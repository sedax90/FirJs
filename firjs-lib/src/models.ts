import { ContextMenuView } from "./components/common/context-menu/context-menu-view";
import { Placeholder } from "./components/placeholder/placeholder";
import { Sequence } from "./components/sequence/sequence";
import { ComponentCreator } from "./utils/component-creator";
import { ClickEvent } from "./utils/event-utils";
import { Observable } from "./utils/observable";

export interface ComponentWithView {
    view: ElementView;
}

export interface ComponentInstance extends ComponentWithView {
    view: ComponentView;
    context: Context;
    parentSequence: Sequence | null;

    findByClick: (click: ClickEvent) => ComponentInstance | null;
}

export interface ElementView {
    element: HTMLElement | SVGElement;
    parent?: HTMLElement | SVGElement;
}

export interface ComponentView extends ElementView {
    width: number;
    height: number;
    joinX: number;

    setSelected?: (status: boolean) => void;
    setDragging?: (status: boolean) => void;
}

export type NodeType = 'choice' | 'map' | 'start' | 'end' | 'task';

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

interface PublicEvents {
    onNodeSelect?: (event: NodeSelectEvent) => void;
    onNodeDeselect?: (event: NodeDeselectEvent) => void;
    onNodeAdd?: (event: NodeAddEvent) => void;
    onNodeMove?: (event: NodeMoveEvent) => void;
    onNodeRemove?: (event: NodeRemoveEvent) => void;
    onTreeChange?: (event: TreeChangeEvent) => void;

    canRemoveNode?: (event: NodeRemoveRequestEvent) => Promise<boolean>;
    canDropNode?: (event: NodeDropEvent) => Promise<boolean>;
}

interface PublicOverriders {
    overrideLabel?: (node: Node) => Promise<string>;
    overrideIcon?: (node: Node) => Promise<string>;
    overrideColumnLabel?: (node: Node, parent: Node | null, columnIndex: number) => Promise<string>;
}

export interface WorkspaceStyleOptions {
    fontSize: string;
    fontFamily: string;
}

export interface WorkspaceInitOptions {
    style: WorkspaceStyleOptions;
    strings: Record<string, string>;
}

export interface WorkspaceInit extends PublicEvents {
    parent: HTMLElement;
    tree: Node[];
    options?: WorkspaceInitOptions;

    overrideLabel?: (node: Node) => Promise<string>;
    overrideIcon?: (node: Node) => Promise<string>;
    overrideColumnLabel?: (node: Node, parent: Node | null, columnIndex: number) => Promise<string>;
}

export interface Context {
    tree: Node[];
    designerState: DesignerState;
    options: WorkspaceInitOptions;

    userDefinedListeners?: PublicEvents;
    userDefinedOverriders?: PublicOverriders;

    onDefinitionChange?: (tree: Node[], preservePositionAndScale: boolean) => void;

    componentCreator: ComponentCreator;
}

export interface DesignerState {
    selectedNode: Observable<ComponentInstance | null>;
    deselectedNode: Observable<ComponentInstance>;
    zoomLevel: number;

    placeholders?: Placeholder[];
    tempNodeToDrop?: Node;
    workspaceRect?: DOMRect;
    isDragging?: boolean;
    isPressingCtrl?: boolean;
    workspacePosition?: Vector;
}

export interface ClickInteraction {
    onStart(position: Vector): void;
    onMove(delta: Vector): ClickInteraction | void;
    onEnd(): void;
}

export interface WheelInteraction {
    onWheel(delta: number): void;
}

export interface KeyboardInteraction {
    onPress(e: KeyboardEvent): void;
    onRelease(e: KeyboardEvent): void;
}

interface GenericNodeEvent {
    node: Node;
    parent: Node | null;
}

export interface NodeSelectEvent extends GenericNodeEvent { }

export interface NodeDeselectEvent extends GenericNodeEvent { }

export interface NodeRemoveEvent extends GenericNodeEvent { }

export interface NodeRemoveRequestEvent extends GenericNodeEvent { }

export interface NodeAddEvent extends GenericNodeEvent { }

export interface NodeMoveEvent extends GenericNodeEvent {
    previousParent: Node | null;
    previousIndex: number;
    currentIndex: number;
}

export interface NodeDropEvent extends GenericNodeEvent {
    action: "add" | "move";
}

export interface TreeChangeEvent {
    tree: Node[];
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
}