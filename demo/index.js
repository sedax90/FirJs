let = i = 0;
const tree = [
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
        label: "Choice 1",
        type: "choice",
        props: {
            custom: true,
            choices: [
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
                ],
                [

                ]
            ]
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
        label: "Choice 1",
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
                ]
            ]
        }
    },
    {
        id: i++,
        label: "Pass 2",
        type: "task",
    },
    {
        id: i++,
        label: "Choice with a very very very very looooooooooooooooooooooooooooooooooooong label...",
        type: "choice",
        props: {
            choices: [
                [],
                [],
            ]
        }
    },
    {
        id: i++,
        label: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec pretium nisi, in bibendum dui. Nunc id porttitor ipsum.",
        type: "task",
    },
    {
        id: i++,
        label: "Choice (node-3)",
        type: "choice",
        props: {
            choices: [
                [
                    {
                        id: i++,
                        label: "node-10",
                        type: "task",
                    },
                    {
                        id: i++,
                        label: "Choice (node-15)",
                        type: "choice",
                        props: {
                            choices: [
                                [
                                    {
                                        id: i++,
                                        label: "node-16",
                                        type: "task",
                                    },
                                    {
                                        id: i++,
                                        label: "node-17",
                                        type: "task",
                                    },
                                ],
                                [
                                    {
                                        id: i++,
                                        label: "node-18",
                                        type: "task",
                                    },
                                ],
                            ]
                        }
                    },
                    {
                        id: i++,
                        label: "node-1",
                        type: "task",
                    },
                ],
                [
                    {
                        id: i++,
                        label: "Map (node-4)",
                        type: "map",
                        props: {
                            children: [],
                        }
                    },
                    {
                        id: i++,
                        label: "node-11",
                        type: "task",
                    },
                    {
                        id: i++,
                        label: "node-12",
                        type: "task",
                    },
                    {
                        id: i++,
                        label: "node-13",
                        type: "task",
                    },
                ],
                [
                    {
                        id: i++,
                        label: "node-14",
                        type: "task",
                    },
                    {
                        id: i++,
                        label: "Map (node-4)",
                        type: "map",
                        props: {
                            children: [
                                {
                                    id: i++,
                                    label: "node-5",
                                    type: "task",
                                },
                                {
                                    id: i++,
                                    label: "Map (node-4)",
                                    type: "map",
                                    props: {
                                        children: [
                                            {
                                                id: i++,
                                                label: "node-5",
                                                type: "task",
                                            },
                                            {
                                                id: i++,
                                                label: "Choice (node-15)",
                                                type: "choice",
                                                props: {
                                                    choices: [
                                                        [
                                                            {
                                                                id: i++,
                                                                label: "node-16",
                                                                type: "task",
                                                            },
                                                            {
                                                                id: i++,
                                                                label: "node-17",
                                                                type: "task",
                                                            },
                                                        ],
                                                        [
                                                            {
                                                                id: i++,
                                                                label: "node-18",
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
        id: i++,
        label: "Map (node-4)",
        type: "map",
        props: {
            children: [
                {
                    id: i++,
                    label: "node-5",
                    type: "task",
                },
                {
                    id: i++,
                    label: "node-6",
                    type: "task",
                },
            ],
        }
    },
    {
        id: i++,
        label: "node-2",
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
        }
    },
    onNodeAdd: (e) => {
        console.debug("ON NODE ADD:", e);
        showToast('onNodeAdd');
    },
    onNodeMove: (e) => {
        console.debug("ON NODE MOVE:", e);
        showToast('onNodeMove');
    },
    onNodeSelect: (e) => {
        console.debug("ON NODE SELECTED:", e);
        showToast('onNodeSelect');
    },
    onNodeDeselect: (e) => {
        console.debug("ON NODE DESELECTED:", e);
        showToast('onNodeDeselect');
    },
    onNodeRemove: (e) => {
        console.debug("ON NODE REMOVED", e);
        showToast('onNodeRemove');
    },
    onTreeChange: (e) => {
        console.debug("ON TREE CHANGE", e);
        showToast('onTreeChange');
    },
    onWorkflowPan: (e) => {
        console.debug("ON WORKFLOW PAN", e);
        showToast('onWorkflowPan');
    },
    onWorkflowScale: (e) => {
        console.debug("ON WORKFLOW SCALE", e);
        showToast('onWorkflowScale');
    },
    onFlowModeChange: (e) => {
        console.debug("ON FLOW MODE CHANGE", e);
        showToast('onFlowModeChange');
    },
    onNodeHover: (e) => {
        console.debug("ON NODE HOVER", e);
        showToast("onNodeHover");
    },
    onNodeLeave: (e) => {
        console.debug('ON NODE LEAVE', e);
        showToast('onNodeLeave');
    },
    // canDropNode: (e) => {
    //     console.debug("ON CAN NODE DROP", e);
    //     showToast('canDropNode');

    //     return new Promise((resolve, reject) => {
    //         resolve({
    //             allowed: true,
    //             label: "Lorem ipsum dolor sit docet",
    //         });
    //     });
    // },
    canAttachNode: (e) => {
        console.debug("ON CAN ATTACH DROP", e);
        showToast('canAttachNode');

        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },
    canRemoveNode: (e) => {
        console.debug("ON CAN REMOVE NODE", e);
        showToast('canRemoveNode');

        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },
    canSelectNode: (e) => {
        console.debug("ON CAN SELECT NODE", e);
        showToast('canSelectNode');

        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },
    canDeselectNode: (e) => {
        console.debug("ON CAN DESELECT NODE", e);
        showToast('canDeselectNode');

        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },
    overrideLabel: (node) => {
        return new Promise((resolve, reject) => {
            resolve(node?.label);
        });
    },
    overrideIcon: (node) => {
        return new Promise((resolve, reject) => {
            if (node.type === 'task') {
                resolve('./assets/task.svg');
            }
            else if (node.type === 'terminator') {
                const icon = '<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48"><path d="M330 726h300V426H330v300Zm150.266 250q-82.734 0-155.5-31.5t-127.266-86q-54.5-54.5-86-127.341Q80 658.319 80 575.5q0-82.819 31.5-155.659Q143 347 197.5 293t127.341-85.5Q397.681 176 480.5 176q82.819 0 155.659 31.5Q709 239 763 293t85.5 127Q880 493 880 575.734q0 82.734-31.5 155.5T763 858.316q-54 54.316-127 86Q563 976 480.266 976Zm.234-60Q622 916 721 816.5t99-241Q820 434 721.188 335 622.375 236 480 236q-141 0-240.5 98.812Q140 433.625 140 576q0 141 99.5 240.5t241 99.5Zm-.5-340Z" /></svg>';
                const element = document.createElement('div');
                element.innerHTML = icon;
                const svg = element.firstChild;
                element.remove();

                return resolve(svg);
            }
            else if (node.type === 'choice') {
                const element = document.createElement('i');
                element.classList.add('bi', 'bi-shuffle');
                return resolve(element);
            }
            else if (node.type === 'map') {
                const element = document.createElement('i');
                element.classList.add('bi', 'bi-shuffle');
                return resolve(element);
            }
            else {
                resolve('');
            }
        });
    },
    overrideColumnLabel: (node, parentNode, columnIndex) => {
        return new Promise((resolve, reject) => {
            return resolve(`Rule for choice ${columnIndex + 1}`);
        });
    },
    overrideComponentMethods: {
        task: {
            findByClick: (instance) => {
                if (instance.node.id === 0) {
                    return (click, instance) => {
                        const node = instance.node;
                        console.debug('findByClick', node);

                        const view = instance.view;
                        const viewContains = view.getSelectableElement()?.contains(click.target);
                        if (viewContains) {
                            return instance;
                        }

                        return null;
                    };
                }
                else {
                    return null;
                }
            }
        }
    }
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
            const rect = originaElement.getBoundingClientRect();

            ghost = originaElement.cloneNode(true);
            ghost.classList.add("ghost");
            ghost.classList.remove('bg-white');
            ghost.classList.remove('border');
            ghost.style.width = rect.width + 'px';
            ghost.style.height = rect.height + 'px';
            ghost.style.background = 'lightsteelblue';

            document.body.appendChild(ghost);
            var offsetX = (event.clientX - rect.left);
            var offsetY = (event.clientY - rect.top);

            event.dataTransfer.setDragImage(ghost, offsetX, offsetY);
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

function showToast(type) {
    let bg = '';
    let color = 'white';

    switch (type) {
        case 'onNodeDeselect':
            bg = "linear-gradient(to right, #00b09b, #96c93d)";
            break;

        case 'canDropNode':
            bg = "linear-gradient(90deg, hsla(186, 33%, 94%, 1) 0%, hsla(216, 41%, 79%, 1) 100%)";
            color = "#000";
            break;

        case 'onNodeRemove':
        case 'onNodeRemoveRequest':
            bg = 'linear-gradient(68.3deg, rgba(245,177,97,1) 0.4%, rgba(236,54,110,1) 100.2%)';
            break;

        case 'onTreeChange':
            bg = 'radial-gradient( circle farthest-corner at 10% 20%,  rgba(255,94,247,1) 17.8%, rgba(2,245,255,1) 100.2% )';
            break;

        case 'onWorkflowPan':
            bg = 'linear-gradient(90deg, hsla(311, 74%, 87%, 1) 0%, hsla(275, 19%, 88%, 1) 100%)';
            color = "#000";
            break;

        case 'onWorkflowScale':
            bg = 'linear-gradient(90deg, hsla(312, 77%, 86%, 1) 0%, hsla(220, 61%, 79%, 1) 100%)';
            color = '#000';
            break;

        case 'canSelectNode':
        case 'canDeselectNode':
            bg = 'linear-gradient(90deg, hsla(187, 82%, 65%, 1) 0%, hsla(65, 77%, 63%, 1) 50%, hsla(327, 67%, 74%, 1) 100%)';
            color = '#000';
            break;

        case 'onFlowModeChange':
            bg = 'linear-gradient(90deg, hsla(202, 71%, 27%, 1) 0%, hsla(176, 45%, 66%, 1) 100%)';
            break;

        case 'onNodeHover':
            bg = 'linear-gradient(90deg, hsla(260, 34%, 48%, 1) 0%, hsla(330, 53%, 77%, 1) 100%)';
            break;

        case 'onNodeLeave':
            bg = 'linear-gradient(90deg, hsla(305, 93%, 26%, 1) 0%, hsla(346, 91%, 87%, 1) 100%)';
            break;
    }

    Toastify({
        text: `<div style="line-height: 1;">Event <b>${type}</b> fired.<br><small class="opacity-75">For more info open your console.</small></div>`,
        duration: 2000,
        newWindow: true,
        close: false,
        gravity: "bottom",
        position: "right",
        stopOnFocus: true,
        escapeMarkup: false,
        style: {
            background: bg,
            color: color,
        }
    }).showToast();
}