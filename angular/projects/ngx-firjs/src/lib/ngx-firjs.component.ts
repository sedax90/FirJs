import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { DeselectNodeRequestEvent, FlowMode, FlowModeChangeEvent, Node, NodeAddEvent, NodeAttachEvent, NodeDeselectEvent, NodeHoverEvent, NodeLeaveEvent, NodeMoveEvent, NodeRemoveEvent, NodeSelectEvent, SelectNodeRequestEvent, TreeChangeEvent, Vector, WorkflowPanEvent, WorkflowScaleEvent, Workspace, WorkspaceOptions, OverrideViewMap } from '@sedax90/firjs';

@Component({
  selector: 'firjs',
  templateUrl: './ngx-firjs.component.html',
  styleUrls: [
    './ngx-firjs.component.scss',
  ],
  encapsulation: ViewEncapsulation.None,
})
export class NgxFirjsComponent implements OnInit {

  @ViewChild('workflowRoot', { static: true }) workflowRoot!: ElementRef;

  @Input() set tree(value: Node[]) {
    this._tree = value;

    if (this._workspace) {
      this._workspace.setTree(value);
    }
  }
  get tree(): Node[] {
    return this._tree;
  }

  @Input() set options(options: WorkspaceOptions) {
    if (this._workspace) {
      this._workspace.setOptions(options);
    }
  }

  @Input() set canDropNode(fn: (event: NodeHoverEvent) => Promise<{
    allowed: boolean;
    label?: string;
  }>) {
    this._canDropNode = fn;

    if (this._workspace && this._workspace.context && this._workspace.context.userDefinedFunctions) {
      this._workspace.context.userDefinedFunctions.canDropNode = fn;
    }
  }

  @Input() set canRemoveNode(fn: (event: NodeRemoveEvent) => Promise<boolean>) {
    this._canRemoveNode = fn;

    if (this._workspace && this._workspace.context && this._workspace.context.userDefinedFunctions) {
      this._workspace.context.userDefinedFunctions.canRemoveNode = fn;
    }
  }

  @Input() set canAttachNode(fn: (event: NodeAttachEvent) => Promise<boolean>) {
    this._canAttachNode = fn;

    if (this._workspace && this._workspace.context && this._workspace.context.userDefinedFunctions) {
      this._workspace.context.userDefinedFunctions.canAttachNode = fn;
    }
  }

  @Input() set canSelectNode(fn: (event: SelectNodeRequestEvent) => Promise<boolean>) {
    this._canSelectNode = fn;

    if (this._workspace && this._workspace.context && this._workspace.context.userDefinedFunctions) {
      this._workspace.context.userDefinedFunctions.canSelectNode = fn;
    }
  }

  @Input() set canDeselectNode(fn: (event: DeselectNodeRequestEvent) => Promise<boolean>) {
    this._canDeselectNode = fn;

    if (this._workspace && this._workspace.context && this._workspace.context.userDefinedFunctions) {
      this._workspace.context.userDefinedFunctions.canDeselectNode = fn;
    }
  }

  @Input() set overrideLabel(fn: (node: Node) => Promise<string>) {
    this._overrideLabel = fn;
  }

  @Input() set overrideIcon(fn: (node: Node) => Promise<string>) {
    this._overrideIcon = fn;
  }

  @Input() set overrideColumnLabel(fn: (node: Node, parent: Node | null, columnIndex: number) => Promise<string>) {
    this._overrideColumnLabel = fn;
  }

  @Input() set overrideView(overrideViewMap: OverrideViewMap) {
    this._overrideView = overrideViewMap;
  }

  getSelectedNode(): Node | null {
    if (this._workspace) {
      return this._workspace.getSelectedNode();
    }

    return null;
  }

  setSelectedNode(value: Node | null): void {
    if (this._workspace) {
      this._workspace.setSelectedNode(value);
    }
  }

  getFlowMode(): FlowMode | null {
    if (this._workspace) {
      return this._workspace.getFlowMode();
    }

    return null;
  }

  setFlowMode(flowMode: FlowMode): void {
    if (this._workspace) {
      this._workspace.setFlowMode(flowMode);
    }
  }

  @Output() onNodeAdd: EventEmitter<NodeAddEvent> = new EventEmitter<NodeAddEvent>();
  @Output() onNodeMove: EventEmitter<NodeMoveEvent> = new EventEmitter<NodeMoveEvent>();
  @Output() onNodeSelect: EventEmitter<NodeSelectEvent> = new EventEmitter<NodeSelectEvent>();
  @Output() onNodeDeselect: EventEmitter<NodeDeselectEvent> = new EventEmitter<NodeDeselectEvent>();
  @Output() onNodeRemove: EventEmitter<NodeRemoveEvent> = new EventEmitter<NodeRemoveEvent>();
  @Output() onTreeChange: EventEmitter<TreeChangeEvent> = new EventEmitter<TreeChangeEvent>();
  @Output() onWorkflowPan: EventEmitter<WorkflowPanEvent> = new EventEmitter<WorkflowPanEvent>();
  @Output() onWorkflowScale: EventEmitter<WorkflowScaleEvent> = new EventEmitter<WorkflowScaleEvent>();
  @Output() onFlowModeChange: EventEmitter<FlowModeChangeEvent> = new EventEmitter<FlowModeChangeEvent>();
  @Output() onNodeHover: EventEmitter<NodeHoverEvent> = new EventEmitter<NodeHoverEvent>();
  @Output() onNodeLeave: EventEmitter<NodeLeaveEvent> = new EventEmitter<NodeLeaveEvent>();

  private _canDropNode!: (event: NodeHoverEvent) => Promise<{
    allowed: boolean;
    label?: string;
  }>;
  private _canRemoveNode!: (event: NodeRemoveEvent) => Promise<boolean>;
  private _canAttachNode!: (event: NodeAttachEvent) => Promise<boolean>;
  private _canSelectNode!: (event: SelectNodeRequestEvent) => Promise<boolean>;
  private _canDeselectNode!: (event: DeselectNodeRequestEvent) => Promise<boolean>;

  private _overrideLabel!: (node: Node) => Promise<string>;
  private _overrideIcon!: (node: Node) => Promise<string>;
  private _overrideColumnLabel!: (node: Node, parent: Node | null, columnIndex: number) => Promise<string>;
  private _overrideView!: OverrideViewMap;

  constructor() { }

  private _workspace!: Workspace;
  private _tree: Node[] = [];

  ngOnInit(): void {
    Workspace.init({
      parent: this.workflowRoot.nativeElement,
      tree: this._tree,
      onNodeAdd: (event: NodeAddEvent) => {
        this.onNodeAdd.emit(event);
      },
      onNodeMove: (event: NodeMoveEvent) => {
        this.onNodeMove.emit(event);
      },
      onNodeSelect: (event: NodeSelectEvent) => {
        this.onNodeSelect.emit(event);
      },
      onNodeDeselect: (event: NodeSelectEvent) => {
        this.onNodeDeselect.emit(event);
      },
      onNodeRemove: (event: NodeRemoveEvent) => {
        this.onNodeRemove.emit(event);
      },
      onTreeChange: (event: TreeChangeEvent) => {
        this.onTreeChange.emit(event);
      },
      onWorkflowPan: (event: WorkflowPanEvent) => {
        this.onWorkflowPan.emit(event);
      },
      onWorkflowScale: (event: WorkflowScaleEvent) => {
        this.onWorkflowScale.emit(event);
      },
      onFlowModeChange: (event: FlowModeChangeEvent) => {
        this.onFlowModeChange.emit(event);
      },
      onNodeHover: (event: NodeHoverEvent) => {
        this.onNodeHover.emit(event);
      },
      onNodeLeave: (event: NodeLeaveEvent) => {
        this.onNodeLeave.emit(event);
      },
      canDropNode: this._canDropNode,
      canRemoveNode: this._canRemoveNode,
      canAttachNode: this._canAttachNode,
      canSelectNode: this._canSelectNode,
      canDeselectNode: this._canDeselectNode,
      overrideLabel: this._overrideLabel,
      overrideIcon: this._overrideIcon,
      overrideColumnLabel: this._overrideColumnLabel,
      overrideView: this._overrideView,
    }).then(
      (ws: Workspace) => {
        this._workspace = ws;
      }
    ).catch((e: any) => {
      console.error(e);
    });
  }

  fitAndCenter(): void {
    if (!this._workspace) return;

    this._workspace.fitAndCenter();
  }

  startDrag(element: HTMLElement, startPosition: Vector, node: Node): void {
    if (!this._workspace) return;

    this._workspace.startDrag(element, startPosition, node);
  }

  async draw(suppressEvents: boolean = true): Promise<void> {
    return await this._workspace.draw(suppressEvents);
  }
}
