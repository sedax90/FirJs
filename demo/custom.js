let = i = 0;
const tree = [
    {
        id: i++,
        label: "Map 1",
        type: "map",
        props: {
            custom: true,
        }
    },
    {
        id: i++,
        label: "Pass 1",
        type: "task",
        props: {
            custom: true,
        }
    },
    {
        id: i++,
        label: "Entity A",
        type: "choice",
        props: {
            custom: true,
            choices: [
                [
                    {
                        id: i++,
                        label: "Condition 1",
                        type: 'task',
                    },
                    {
                        id: i++,
                        label: "Terminator 1",
                        type: 'terminator',
                    }
                ],
                [],
                [
                    {
                        id: i++,
                        label: "Map (node-4)",
                        type: "map",
                        props: {
                            children: [

                            ],
                        }
                    },
                    {
                        id: i++,
                        label: "Condition 2",
                        type: 'task',
                    }
                ],
                [
                    {
                        id: i++,
                        label: "Terminator 2",
                        type: "terminator",
                    },
                ],
                [],
                [],
                []
            ]
        }
    },
    {
        id: i++,
        label: "Pass 2",
        type: "task",
    },
];

const root = document.getElementById('root');
firjs.init({
    parent: root,
    tree: [...tree],
    options: {
        flowMode: "horizontal",
        style: {
            fontSize: "0.875em",
        },
        strings: {
            'context-menu.workspace.actions.fitandcenter.label': "Fit & center",
        },
        infinite: true,
    },
    overrideView: {
        task: (generatorContext, context) => drawTask(generatorContext, context),
        choice: (generatorContext, context) => drawNodeTree(generatorContext, context),
    },
}).then((workspace) => {
    const elements = document.getElementsByClassName("draggable");
    for (const element of elements) {
        let ghost;

        element.addEventListener("dragstart", (event) => {
            event.stopPropagation();

            const node = {
                id: i++,
                type: element.dataset.type,
                label: `New node ${i}`,
            };

            const originaElement = event.target;
            const rect = event.target.getBoundingClientRect();

            ghost = originaElement.cloneNode(true);
            ghost.classList.add("ghost");
            ghost.style.width = rect.width + 'px';
            ghost.style.height = rect.height + 'px';

            document.body.appendChild(ghost);
            // var offsetX = (event.clientX - rect.left);
            // var offsetY = (event.clientY - rect.top);

            event.dataTransfer.setDragImage(ghost, 0, 0);
            event.dataTransfer?.setData('text/plain', JSON.stringify(node));

            workspace.startDrag(originaElement, {
                x: event.pageX,
                y: event.pageY,
            }, node);
            return;
        });

        element.addEventListener('dragend', (event) => {
            if (ghost) {
                ghost.remove();
            }
        });
    }

    // Bootstrap demo scripts

    const centerWorkflowBtn = document.getElementById('centerWorkflow');
    centerWorkflowBtn.addEventListener('click', () => {
        workspace.fitAndCenter();
    });

    const redrawBtn = document.getElementById('redrawBtn');
    redrawBtn.addEventListener('click', () => {
        workspace.draw();
    });

    const changeFlowModeBtn = document.getElementById('changeFlowMode');
    changeFlowModeBtn.addEventListener('click', () => {
        const dir = workspace.getFlowMode();
        workspace.setFlowMode((dir === 'horizontal') ? 'vertical' : 'horizontal');
    });
});

async function drawTask(generatorContext, context) {
    return new Promise(async (resolve, reject) => {
        const creationHelper = firjs.CreationHelper.getInstance(context);
        const domHelper = firjs.DomHelper;
        const labelHelper = firjs.LabelHelper;

        const node = generatorContext.node;
        const parentElement = generatorContext.parentElement;

        // return resolve(null);

        if (node.type === 'task' && node.props?.custom) {
            const element = domHelper.svg('g', {
                class: "custom",
            });

            element.appendChild(domHelper.svg('rect', {
                width: 200,
                height: 40,
                stroke: "green",
                fill: "yellow",
                rx: 3,
            }));

            const text = domHelper.svg('text', {
                fill: 'black',
            });
            text.append(node.label);
            element.appendChild(text);

            const labelSize = labelHelper.calculateLabelSize(text);
            const offsetX = (200 - labelSize.width) / 2;
            const offsetY = 40 - labelSize.height;
            domHelper.translate(text, offsetX, offsetY);

            const componentView = await creationHelper.createTaskComponent(node, parent, {
                element: element,
                parentElement: parentElement,
                width: 200,
                height: 40,
                joinX: 100,
                joinY: 20,
            });
            resolve(componentView);
        }
        else {
            resolve(null);
        }
    });
}

async function drawNodeTree(generatorContext, context) {
    return new Promise(async (resolve, reject) => {
        const creationHelper = firjs.CreationHelper.getInstance(context);
        const domHelper = firjs.DomHelper;

        const node = generatorContext.node;
        const parent = generatorContext.parent;
        const parentElement = generatorContext.parentElement;

        // return resolve(null);

        if (node.type === 'choice' && node.props?.custom) {
            const element = domHelper.svg('g', {
                class: "custom",
            });

            const label = domHelper.svg('g', {
                class: "label",
            });

            const totalChoices = node.props.choices.length;

            const square = domHelper.svg('rect', {
                width: 100,
                height: 30 * totalChoices,
                stroke: "red",
                'stroke-width': 2,
                fill: "white",
                rx: 5,
            });
            label.appendChild(square);

            const branches = new Array(totalChoices);
            for (let i = 0; i < totalChoices; i++) {
                const branch = node.props.choices[i];

                const row = domHelper.svg('text', {
                    width: 100,
                    height: 40,
                    stroke: "black",
                });
                row.append(`Row ${i}`);
                label.appendChild(row);
                domHelper.translate(row, 10, 26 * (i + 1));

                // Create sequence
                const sequence = await creationHelper.createSequence(branch, node, element);

                const content = domHelper.svg('g');
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

            for (let i = 0; i < totalChoices; i++) {
                const branch = branches[i];
                branch.origin = { x: 100, y: (i + 1) * 25 };
            }

            const customNode = await creationHelper.createTreeComponent(node, parent, label, element, parentElement, branches);

            resolve(customNode);
        }
        else {
            resolve(null);
        }
    });
}