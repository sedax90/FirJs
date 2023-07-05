import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DeselectNodeRequestEvent, FlowMode, NgxFirjsComponent, Node, NodeAddEvent, NodeDeselectEvent, NodeMoveEvent, NodeRemoveEvent, NodeRemoveRequestEvent, NodeSelectEvent, NodeType, OverrideComponentMethodsMap, OverrideViewMap, SelectNodeRequestEvent, TreeChangeEvent, WorkflowPanEvent, WorkflowScaleEvent, Workspace, WorkspaceOptions } from '../../../../../ngx-firjs/src/public-api';


@Component({
  selector: 'app-designer',
  templateUrl: './designer.component.html',
  styleUrls: ['./designer.component.scss']
})
export class DesignerComponent implements OnInit {

  @ViewChild(NgxFirjsComponent) firjsWorkflow!: NgxFirjsComponent;

  @Input() tree: Node[] = [];
  @Input() set options(value: Partial<WorkspaceOptions>) {
    this._options = value;
  }
  get options() {
    return this._options;
  }

  @Input() overrideView!: OverrideViewMap;
  @Input() overrideComponentMethods!: OverrideComponentMethodsMap;

  flowMode: FlowMode = 'vertical';

  private _ghost!: HTMLElement;
  private _options!: Partial<WorkspaceOptions>;

  constructor() { }

  ngOnInit(): void { }

  onNodeAdd(event: NodeAddEvent): void {
    console.debug('onNodeAdd', event);
  }

  onNodeMove(event: NodeMoveEvent): void {
    console.debug('onNodeMove', event);
  }

  canSelectNode(event: SelectNodeRequestEvent): Promise<boolean> {
    console.debug('canSelectNode', event);
    return Promise.resolve(true);
  }

  onNodeSelect(event: NodeSelectEvent): void {
    console.debug('onNodeSelect', event);
  }

  canDeselectNode(event: DeselectNodeRequestEvent): Promise<boolean> {
    console.debug('canDeselectNode', event);
    return Promise.resolve(true);
  }

  onNodeDeselect(event: NodeDeselectEvent): void {
    console.debug('onNodeDeselect', event);
  }

  canRemoveNode(event: NodeRemoveEvent): Promise<boolean> {
    console.debug('canRemoveNode', event);
    return Promise.resolve(true);
  }

  onNodeRemove(event: NodeRemoveEvent): void {
    console.debug('onNodeRemove', event);
  }

  onNodeRemoveRequest(event: NodeRemoveRequestEvent): void {
    console.debug('onNodeRemoveRequest', event);
  }

  onTreeChange(event: TreeChangeEvent): void {
    console.debug('onTreeChange', event);
  }

  onWorkflowPan(event: WorkflowPanEvent): void {
    console.debug('onWorkflowPan', event);
  }

  onWorkflowScale(event: WorkflowScaleEvent): void {
    console.debug('onWorkflowScale', event);
  }

  onDragstart(event: DragEvent, type: NodeType): void {
    const element = event.target as HTMLElement;
    const rect = element.getBoundingClientRect();

    this._ghost = element.cloneNode(true) as HTMLElement;
    this._ghost.classList.add("ghost");
    this._ghost.style.width = rect.width + 'px';
    this._ghost.style.height = rect.height + 'px';

    document.body.appendChild(this._ghost);

    const node = {
      id: new Date().getTime().toString(),
      type: type,
    };

    event.dataTransfer?.setDragImage(this._ghost, 0, 0);
    event.dataTransfer?.setData('text/plain', JSON.stringify(node));

    this.firjsWorkflow.startDrag(element as HTMLElement, {
      x: event.pageX,
      y: event.pageY,
    }, node);
  }

  onDragEnd(event: DragEvent): void {
    if (this._ghost) {
      this._ghost.remove();
    }
  }

  changeFlowMode(): void {
    const currentFlowMode = this.firjsWorkflow.getFlowMode();
    this.firjsWorkflow.setFlowMode(currentFlowMode === 'horizontal' ? 'vertical' : "horizontal");
  }
}
