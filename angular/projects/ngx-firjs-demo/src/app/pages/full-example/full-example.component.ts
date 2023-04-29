import { Component, OnInit } from '@angular/core';
import { Node } from '../../../../../ngx-firjs/src/public-api';

@Component({
  selector: 'app-full-example',
  templateUrl: './full-example.component.html',
  styleUrls: ['./full-example.component.scss']
})
export class FullExampleComponent implements OnInit {

  constructor() { }

  tree: Node[] = [];

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
}
