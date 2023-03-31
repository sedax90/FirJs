import { Component, ViewChild } from '@angular/core';
import { NgxFirjsComponent } from '../../../ngx-firjs/src/public-api';
import { Node, NodeAddEvent, NodeDeselectEvent, NodeMoveEvent, NodeRemoveEvent, NodeRemoveRequestEvent, NodeSelectEvent, NodeType, TreeChangeEvent } from '@sedax90/firjs';

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

  onNodeSelect(event: NodeSelectEvent): void {
    console.debug('onNodeSelect', event);
  }

  onNodeDeselect(event: NodeDeselectEvent): void {
    console.debug('onNodeDeselect', event);
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
}
