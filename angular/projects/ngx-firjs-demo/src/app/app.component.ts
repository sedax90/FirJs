import { Component, ViewChild } from '@angular/core';
import { DeselectNodeRequestEvent, FlowMode, NgxFirjsComponent, Node, NodeAddEvent, NodeDeselectEvent, NodeMoveEvent, NodeRemoveEvent, NodeRemoveRequestEvent, NodeSelectEvent, NodeType, SelectNodeRequestEvent, TreeChangeEvent, WorkflowPanEvent, WorkflowScaleEvent } from '../../../ngx-firjs/src/public-api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ngx-firjs-demo';

  @ViewChild(NgxFirjsComponent, { static: true }) firjsWorkflow!: NgxFirjsComponent;

  constructor() { }

  tree: Node[] = [];
  currentFlowMode: FlowMode = 'vertical'

  private _ghost!: HTMLElement;

  ngOnInit(): void {
    let i = 0;

    this.tree = [
      {
        id: (i++).toString(),
        label: "Lorem ipsum dolor sit amet, consectetur",
        type: "task",
      },
      {
        id: (i++).toString(),
        label: "Choice (node-3)",
        type: "choice",
        props: {
          choices: [
            [
              {
                id: (i++).toString(),
                type: "task",
              },
              {
                id: (i++).toString(),
                label: "Choice (node-15)",
                type: "choice",
                props: {
                  choices: [
                    [
                      {
                        id: (i++).toString(),
                        type: "task",
                      },
                      {
                        id: (i++).toString(),
                        type: "task",
                      },
                    ],
                    [
                      {
                        id: (i++).toString(),
                        type: "task",
                      },
                    ],
                  ]
                }
              },
              {
                id: (i++).toString(),
                type: "task",
              },
            ],
            [
              {
                id: (i++).toString(),
                label: "Map (node-4)",
                type: "map",
                props: {
                  children: [],
                }
              },
              {
                id: (i++).toString(),
                type: "task",
              },
              {
                id: (i++).toString(),
                type: "task",
              },
              {
                id: (i++).toString(),
                type: "task",
              },
            ],
            [
              {
                id: (i++).toString(),
                type: "task",
              },
              {
                id: (i++).toString(),
                label: "Map (node-4)",
                type: "map",
                props: {
                  children: [
                    {
                      id: (i++).toString(),
                      type: "task",
                    },
                    {
                      id: (i++).toString(),
                      label: "Map (node-4)",
                      type: "map",
                      props: {
                        children: [
                          {
                            id: (i++).toString(),
                            type: "task",
                          },
                          {
                            id: (i++).toString(),
                            label: "Choice (node-15)",
                            type: "choice",
                            props: {
                              choices: [
                                [
                                  {
                                    id: (i++).toString(),
                                    type: "task",
                                  },
                                  {
                                    id: (i++).toString(),
                                    type: "task",
                                  },
                                ],
                                [
                                  {
                                    id: (i++).toString(),
                                    type: "task",
                                  },
                                ],
                              ]
                            }
                          },
                        ],
                      }
                    },
                  ],
                }
              },
            ]
          ]
        }
      },
      {
        id: (i++).toString(),
        type: "task",
      },
      {
        id: (i++).toString(),
        label: "Map (node-4)",
        type: "map",
        props: {
          children: [
            {
              id: (i++).toString(),
              type: "task",
            },
            {
              id: (i++).toString(),
              type: "task",
            },
          ],
        }
      },
    ];
  }

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
