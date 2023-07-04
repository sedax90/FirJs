import { AfterViewInit, Component, EmbeddedViewRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ChoiceProps, ChoiceViewCreationContext, ComponentView, Context, CreationHelper, DomHelper, LabelHelper, NgxFirjsComponent, Node, OverrideViewMap, TaskViewCreationContext, WorkspaceOptions } from '../../../../../ngx-firjs/src/public-api';
import { DesignerComponent } from '../../components/designer/designer.component';

@Component({
  selector: 'app-custom-view-example',
  templateUrl: './custom-view-example.component.html',
  styleUrls: ['./custom-view-example.component.scss']
})
export class CustomViewExampleComponent implements OnInit, AfterViewInit {

  @ViewChild(DesignerComponent) designerComponent!: DesignerComponent;
  @ViewChild('myTpl', { static: true }) myTpl!: TemplateRef<unknown>;
  @ViewChild('entityFieldsTpl', { static: true }) entityFieldsTpl!: TemplateRef<unknown>;

  private _firJsWorkflow!: NgxFirjsComponent;
  lastClick!: number;

  private _myTplView!: EmbeddedViewRef<unknown>;
  private _entityFieldsTplView!: EmbeddedViewRef<unknown>;

  constructor() { }

  tree: Node[] = [];
  options: Partial<WorkspaceOptions> = {
    infinite: true,
    flowMode: "horizontal",
  };
  overrideView: OverrideViewMap = {
    task: this._drawTask.bind(this),
    choice: this._drawChoice.bind(this),
  };

  ngAfterViewInit(): void {
    this._firJsWorkflow = this.designerComponent.firjsWorkflow;
  }

  ngOnInit(): void {
    let i = 0;

    this.tree = [
      {
        id: (i++).toString(),
        type: "choice",
        label: "Entity 'Product'",
        props: {
          choices: [
            [
              {
                id: (i++).toString(),
                label: "Lorem ipsum dolor sit amet, consectetur",
                type: "task",
              },
            ],
            [],
            [],
            [
              {
                id: (i++).toString(),
                type: "task",
                label: "Foo",
                props: {
                  custom: true,
                }
              },
            ]
          ],
          custom: true,
          fields: [
            'field_1',
            'field_2',
            'field_3',
            'field_4',
          ]
        }
      },
    ];
  }

  private _drawTask(generatorContext: TaskViewCreationContext, context: Context): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const creationHelper = CreationHelper.getInstance(context);

      if (creationHelper) {
        const node = generatorContext.node;
        const parent = generatorContext.parent;
        const parentElement = generatorContext.parentElement;

        // return resolve(null);

        if (node.type === 'task' && node.props && node.props['custom'] && parentElement) {
          let maxWidth = 0;
          let maxHeight = 0;

          const element = DomHelper.svg('g', {
            class: "custom",
          });

          const text = DomHelper.svg('text', {
            fill: 'black',
          });

          if (node.label) {
            text.prepend(node.label);
          }

          element.appendChild(text);

          const labelSize = LabelHelper.calculateLabelSize(text);

          if (this.myTpl) {
            this._myTplView = this.myTpl.createEmbeddedView({});
            this._myTplView.detectChanges();
            const html = this._myTplView.rootNodes[0];

            const htmlContainer = DomHelper.svg('foreignObject');
            htmlContainer.appendChild(html);

            const clonedContent = html.cloneNode(true);
            document.body.appendChild(clonedContent);
            const size = clonedContent.getBoundingClientRect();
            clonedContent.remove();

            if (size.width > maxWidth) {
              maxWidth = size.width;
            }

            if (size.height > maxHeight) {
              maxHeight = size.height;
            }

            element.appendChild(htmlContainer);

            htmlContainer.setAttribute('width', `${size.width}`);
            htmlContainer.setAttribute('height', `${size.height}`);
          }

          const offsetX = (maxWidth - labelSize.width) / 2;
          const offsetY = maxHeight - labelSize.height;
          DomHelper.translate(text, offsetX, offsetY);

          element.prepend(DomHelper.svg('rect', {
            width: maxWidth,
            height: maxHeight,
            stroke: "green",
            fill: "yellow",
            rx: 3,
          }));

          const componentView = await creationHelper.createTaskComponent(node, parent, {
            element: element,
            parentElement: parentElement,
            width: maxWidth,
            height: maxHeight,
            joinX: maxWidth / 2,
            joinY: maxHeight / 2,
          });
          resolve(componentView);
        }
        else {
          resolve(null);
        }
      }
      else {
        resolve(null);
      }
    });
  }

  private _drawChoice(generatorContext: ChoiceViewCreationContext, context: Context): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const creationHelper = CreationHelper.getInstance(context);

      if (creationHelper) {
        const node = generatorContext.node;
        const parent = generatorContext.parent;
        const parentElement = generatorContext.parentElement;

        // return resolve(null);

        const nodeProps = node.props as ChoiceProps;
        if (node.type === 'choice' && nodeProps && nodeProps['custom'] && parentElement) {
          const element = DomHelper.svg('g', {
            class: "custom",
          });

          const entityContainer = DomHelper.svg('g', {
            class: "entity-container",
          });

          const choices = nodeProps.choices;
          const totalChoices = choices.length;

          const fields = nodeProps['fields'];

          this._entityFieldsTplView = this.entityFieldsTpl.createEmbeddedView({ fields: fields });
          this._entityFieldsTplView.detectChanges();
          const html = this._entityFieldsTplView.rootNodes[0];

          const htmlContainer = DomHelper.svg('foreignObject');
          htmlContainer.appendChild(html);

          const clonedContent = html.cloneNode(true);
          document.body.appendChild(clonedContent);
          const size = clonedContent.getBoundingClientRect();

          entityContainer.appendChild(htmlContainer);
          htmlContainer.setAttribute('width', `${size.width}`);
          htmlContainer.setAttribute('height', `${size.height}`);

          // const square = DomHelper.svg('rect', {
          //   width: size.width,
          //   height: size.height,
          //   stroke: "#aaa",
          //   fill: "white",
          //   filter: "drop-shadow(3px 3px 2px rgba(0, 0, 0, 0.1))",
          //   rx: 5,
          // });
          // entityContainer.prepend(square);

          const branches = new Array(totalChoices);

          if (fields && Array.isArray(fields) && fields.length === totalChoices) {
            for (let i = 0; i < totalChoices; i++) {
              const branch = choices[i];
              // const field = fields[i];

              // const row = DomHelper.svg('g', {
              //   class: 'row',
              // });

              // const rowContentText = DomHelper.svg('text', {
              //   width: 100,
              //   height: 40,
              //   fill: "black",
              // });
              // rowContentText.append(field);

              // row.appendChild(rowContentText);

              // entityContainer.appendChild(row);
              // DomHelper.translate(rowContentText, 10, 26 * (i + 1));

              // Create sequence
              const sequence = await creationHelper.createSequence(branch, node, element);

              const content = DomHelper.svg('g');
              content.appendChild(sequence.view.element);

              branches[i] = {
                sequence: sequence,
                content: content,
                width: sequence.view.width,
                height: sequence.view.height,
                joinX: sequence.view.width / 2,
                joinY: sequence.view.height / 2,
                originRelativeToContainer: true,
              };
            }

            const fieldRows = clonedContent.getElementsByClassName('field-row');
            for (let i = 0; i < totalChoices; i++) {
              const branch = branches[i];
              const fieldRow = fieldRows[i];
              const size = fieldRow.getBoundingClientRect();
              branch.origin = { x: size.width, y: (i + 1) * size.height - size.height / 2 };
            }

            const customNode = await creationHelper.createTreeComponent(node, parent, entityContainer, element, parentElement, branches);
            clonedContent.remove();

            resolve(customNode);
          }
          else {
            resolve(null);
          }
        }
        else {
          resolve(null);
        }
      }
      else {
        resolve(null);
      }
    });
  }

  clickBtn(): void {
    this.lastClick = Date.now();
    this._myTplView.detectChanges();
  }
}
