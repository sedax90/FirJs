import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { Node, NodeAddEvent, NodeDeselectEvent, NodeDropEvent, NodeMoveEvent, NodeRemoveEvent, NodeSelectEvent, TreeChangeEvent, Vector, Workspace } from '@sedax90/firjs';

@Component({
  selector: 'firjs',
  templateUrl: './ngx-firjs.component.html',
  styleUrls: [
    '../../node_modules/@sedax90/firjs/styles/workflow-tree.css',
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

  @Input() set canDropNode(fn: (event: NodeDropEvent) => Promise<boolean>) {
    this._canDropNode = fn;

    if (this._workspace && this._workspace.context && this._workspace.context.userDefinedListeners) {
      this._workspace.context.userDefinedListeners.canDropNode = fn;
    }
  }

  @Input() set canRemoveNode(fn: (event: NodeRemoveEvent) => Promise<boolean>) {
    this._canRemoveNode = fn;

    if (this._workspace && this._workspace.context && this._workspace.context.userDefinedListeners) {
      this._workspace.context.userDefinedListeners.canRemoveNode = fn;
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

  @Output() onNodeAdd: EventEmitter<NodeAddEvent> = new EventEmitter<NodeAddEvent>();
  @Output() onNodeMove: EventEmitter<NodeMoveEvent> = new EventEmitter<NodeMoveEvent>();
  @Output() onNodeSelect: EventEmitter<NodeSelectEvent> = new EventEmitter<NodeSelectEvent>();
  @Output() onNodeDeselect: EventEmitter<NodeDeselectEvent> = new EventEmitter<NodeDeselectEvent>();
  @Output() onNodeRemove: EventEmitter<NodeRemoveEvent> = new EventEmitter<NodeRemoveEvent>();
  @Output() onTreeChange: EventEmitter<TreeChangeEvent> = new EventEmitter<TreeChangeEvent>();

  private _canDropNode!: (event: NodeDropEvent) => Promise<boolean>;
  private _canRemoveNode!: (event: NodeRemoveEvent) => Promise<boolean>;
  private _overrideLabel!: (node: Node) => Promise<string>;
  private _overrideIcon!: (node: Node) => Promise<string>;
  private _overrideColumnLabel!: (node: Node, parent: Node | null, columnIndex: number) => Promise<string>;

  constructor() { }

  private _workspace!: Workspace;
  private _tree: Node[] = [];

  ngOnInit(): void {
    Workspace.init({
      parent: this.workflowRoot.nativeElement,
      tree: this._tree,
      options: {
        strings: {},
        style: {
          fontFamily: "",
          fontSize: "",
        }
      },
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
      canDropNode: this._canDropNode,
      canRemoveNode: this._canRemoveNode,
      overrideLabel: this._overrideLabel,
      overrideIcon: this._overrideIcon,
      overrideColumnLabel: this._overrideColumnLabel,
    }).then(
      (ws) => {
        this._workspace = ws;
      }
    ).catch(e => {
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
}
