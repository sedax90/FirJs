import { Placeholder } from "./components/placeholder/placeholder";
import { Sequence } from "./components/sequence/sequence";
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
    onNodeRemove?: (event: NodeRemoveEvent) => void;
    onTreeChange?: (event: TreeChangeEvent) => void;
    onNodeRemoveRequest?: (event: NodeRemoveRequestEvent) => void;
    onNodeDropAllowed?: (event: NodeDropEvent) => boolean;
}

interface PublicOverriders {
    overrideLabel?: (node: Node) => string;
    overrideIcon?: (node: Node) => string;
}

export interface WorkspaceStyleOptions {
    fontSize: string;
    fontFamily: string;
}

export interface WorkspaceInit extends PublicEvents {
    parent: HTMLElement,
    tree: Node[],

    style?: WorkspaceStyleOptions,

    overrideLabel?: (node: Node) => string;
    overrideIcon?: (node: Node) => string;
}

export interface Context {
    tree: Node[];
    designerState: DesignerState;
    style: WorkspaceStyleOptions,

    userDefinedListeners?: PublicEvents;
    userDefinedOverriders?: PublicOverriders;

    onDefinitionChange?: (tree: Node[], preservePositionAndScale: boolean) => void;
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

export interface NodeDropEvent extends GenericNodeEvent { }

export interface TreeChangeEvent {
    tree: Node[];
}

export interface Attributes {
    [name: string]: string | number;
}