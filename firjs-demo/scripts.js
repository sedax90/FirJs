let = i = 0;
const tree = [
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
        label: "node-2",
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
                    label: "node-6",
                    type: "task",
                },
            ],
        }
    },
];

firjs.init({
    parent: document.getElementById('root'),
    tree: [...tree],
    style: {
        fontSize: "0.875em",
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
    onNodeDropAllowed: (e) => {
        console.debug("ON NODE DROP", e);
        showToast('onNodeDrop');

        return true;
    },
    // onNodeRemoveRequest: (e) => {
    //     console.debug("ON NODE REMOVE REQUEST", e);
    //     showToast('onNodeRemoveRequest');
    // },
    overrideLabel: (node) => {
        return node.label.toLowerCase();
    },
    overrideIcon: (node) => {
        if (node.type === 'task') {
            return './assets/task.svg';
        }
        else {
            return '';
        }
    },
}).then((workspace) => {
    const elements = document.getElementsByClassName("draggable");
    for (const element of elements) {
        element.addEventListener("dragstart", (event) => {
            workspace.startDrag(event.target, {
                x: event.pageX,
                y: event.pageY,
            }, {
                id: i++,
                type: element.dataset.type,
                label: `New node ${i}`,
            });
            return;
        });
    }

    // Bootstrap demo scripts

    const centerWorkflowBtn = document.getElementById('centerWorkflow');
    centerWorkflowBtn.addEventListener('click', () => {
        workspace.fitAndCenter();
    });

    const resetBtn = document.getElementById('resetBtn');
    resetBtn.addEventListener('click', () => {
        workspace.setTree([...tree], true);
    }, false);
});

function showToast(type) {
    let bg = '';

    switch (type) {
        case 'onNodeDeselect':
            bg = "linear-gradient(to right, #00b09b, #96c93d)";
            break;

        case 'onNodeRemove':
        case 'onNodeRemoveRequest':
            bg = 'linear-gradient(68.3deg, rgba(245,177,97,1) 0.4%, rgba(236,54,110,1) 100.2%)';
            break;

        case 'onTreeChange':
            bg = 'radial-gradient( circle farthest-corner at 10% 20%,  rgba(255,94,247,1) 17.8%, rgba(2,245,255,1) 100.2% )';
            break;
    }

    Toastify({
        text: `Event <b>${type}</b> fired.<br>For more info open your console.`,
        duration: 4000,
        newWindow: true,
        close: false,
        gravity: "bottom",
        position: "right",
        stopOnFocus: true,
        escapeMarkup: false,
        style: {
            background: bg,
        }
    }).showToast();
}