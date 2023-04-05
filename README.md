# FirJs

![](https://user-images.githubusercontent.com/5001801/224503499-9dd881a7-028f-4b16-824b-b689770bdc0d.png)

## Demo 🚀️

[https://sedax90.github.io/firjs-github-io/](https://sedax90.github.io/firjs-github-io/)

## How to install

`npm i @sedax90/firjs`

## Why ℹ️

I state that this project is freely inspired by the amazing Sequential Workflow Designer: https://github.com/nocode-js/sequential-workflow-designer

**FirJs must not be intended as a ready to use project** but as a simple, generic, dependencies free library for drawing workflows (the only dependencies you will find are for compiling and running the demo).

This library is written entirely in Typescript and was born to remain simple and as agnostic as possible, so that it can be easily integrated into projects where needed.

## Concepts 💡️

The main area is your **Workspace**. A _workspace_ contains a **Workflow**, who is simply a _nodes tree_.

FirJs provides these basic nodes:

- `task` (a generic operation)
- `map` (for/while)
- `choice` (if/switch)
- `terminator` (indicates that the flow ended before its natural end)

The workflow tree has a basic hierarchical structure:

```
[
	{
		id: "123",
		type: 'task',
		label: "Foo", // Optional
		icon: "star", // Optional
	},
	{
		id: "124",
		type: 'map',
		props: {
			children: []
		}
	}
]
```

You can attach all the data you need in the `props` field, they will always be kept.

## Getting started 🔥️

Import the library and create a simple JS object:

```
firjs.init({
    parent: document.getElementById('root'),
    tree: [],
}).then((ws) => { // Enjoy! });
```

The library does not do anything automatically (except node removal), you have to use the exposed functions and events to adapt the library to your needs:

```
onNodeAdd: (e: NodeAddeEvent) => void;
onNodeMove: (e: NodeMoveEvent) => void;
onNodeSelect: (e: NodeSelectEvent) => void;
onNodeDeselect: (e: NodeDeselectEvent) => void;
onNodeRemove: (e: NodeRemoveEvent) => void;
onTreeChange: (e: TreeChangeEvent) => void;
onWorkflowPan: (e: WorkflowPanEvent) => void;
onWorkflowScale: (e: WorkflowScaleEvent) => void;
```

You are not required to initialize event responses when creating the workflow as events are emitted as native Javascript events from the Workspace, so you can subscribe to them simply with:

```
ws.addEventListener('nodeAdd', (event) => {
	// Your logic
});
```

FirJS emits these events:

- `nodeAdd`
- `nodeMove`
- `nodeSelect`
- `nodeDeselect`
- `nodeRemove`
- `treeChange`
- `workflowPan`
- `workflowScale`

If you want to implement some logics during node drop or node remove, you can implement:

```
// This is triggered whenever you move a node over a placeholder and allows you to override whether a node can be added to that placeholder or not (you can also add a custom message for the user if you want).
canDropNode: (e) => Promise<{
	allowed: boolean;
	label?: string;
}>

// This is triggered when you release a node over a placeholder. It's the last chance for you to implement a custom logic for allow/disallow node attachment.
canAttachNode: (e) => Promise<boolean>

// This is triggered before removing a node (with context menu or Del button).
canRemoveNode: (e) => Promise<boolean>
```

When you implement your drag&drop logic, you have to inform the Workspace that you are going to drop a node on the tree:

```
event.dataTransfer.setData('text/plain', JSON.stringify(node));

ws.startDrag(event.target, {
    x: event.pageX,
    y: event.pageY,
}, {
    id: (i++).toString(),
    type: element.dataset.type,
    label: `New node ${i}`, // Optional
});
```

After all, you can pass some options to init for customize some data:

```
style: {
    fontSize: string;
    fontFamily: string;
};
strings: {
    "context-menu.component.actions.remove.label": string,
    "context-menu.component.actions.duplicate.label": string,
    "context-menu.workspace.actions.fitandcenter.label": string,
	"placeholder.not-allowed-to-drop.label": string,
}
```

### Other useful functions:

- `fitAndCenter(): void`: Call it to fit and center the tree (omg really?)
- `setTree(tree: Node[], preservePositionAndScale: boolean = false): void`: Call it to set the tree programmatically.
- `async draw(): Promise<void>`: Call it to force a redraw without passing a new tree.

## Customizations 🎨️

### Advanced customizations

FirJs provide this methods to override your data:

- `overrideLabel(node: Node): Promise<string>`: to override your label.
- `overrideIcon(node: Node): Promise<string>`: to assign a dynamic icon.
- `overrideColumnLabel(node: Node, parent: Node | null, columnIndex: number): Promise<string>`: to assign a dynamic icon.

Both of this functions are executed when a node is drawed.

### Style customizations

You can customize the entire Workspace with only a little bit of CSS. You will find that there are many implemented CSS variables that you can simply override.

## Workspace tips ✨️

- Grab an empty point in the workspace with your **left mouse button** and move it to shift the workflow.
- If you want to move the workflow from any position, before to click press and hold the **Ctrl** or the **Space** button.
- Simply zoom with your **mouse wheel**.
- If you are dragging a node and do you want to cancel the drop operation, simply press **Esc**.
- Right click on a component or on workspace to open the contextual menu with some useful actions.

## Next steps 🗓️

- [ ] Add tests.
- [ ] Angular module.
- [ ] React component.
- [x] Better event management.
- [ ] More customizations.
- [ ] Better mobile.

## How to use this repo 🛠️

Install the required dev dependencies with: `npm i`.

### Run demo while compiling (dev mode)

`npm run start`

Enjoy!

### Run demo only

`npm run run-demo`

## License

This project is released under the MIT license.
