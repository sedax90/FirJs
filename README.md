# FirJs
![](https://user-images.githubusercontent.com/5001801/224503499-9dd881a7-028f-4b16-824b-b689770bdc0d.png)

## How to install
`npm i @sedax90/firjs`

## Why
I state that this project is freely inspired by the amazing Sequential Workflow Designer: https://github.com/nocode-js/sequential-workflow-designer

**FirJs must not be intended as a ready to use project** but as a simple, generic, dependencies free library for drawing workflows (the only dependencies you will find are for compiling and running the demo).

This library is written entirely in Typescript and was born to remain simple and as agnostic as possible, so that it can be easily integrated into projects where needed.

## Concepts
The main area is your **Workspace**. A _workspace_ contains a **Workflow**, who is simply a _nodes tree_.

FirJs provides only three types of nodes:
- `task` (a generic operation)
- `map` (for/while)
- `choice` (if/switch)

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

## Getting started
Import the library and create a simple JS object:
```
const ws = firjs.Workspace.init({
    parent: document.getElementById('root'),
    tree: [],
});
```

The library does not do any type of automatic work, you have to use the exposed functions to implement your logic:
```
	...
    onNodeSelect: (e) => {
        console.debug("ON NODE SELECTED:", e);
    },
    onNodeDeselect: (e) => {
        console.debug("ON NODE DESELECTED:", e);
    },
    onNodeRemove: (e) => {
        console.debug("ON NODE REMOVED", e);
    },
    onTreeChange: (e) => {
        console.debug("ON TREE CHANGE", e);
    },
    onNodeRemoveRequest: (e) => {
		// When you implement it, it will suppress the onNodeRemove function call.
        console.debug("ON NODE REMOVE REQUEST", e);
    },
	...
```

The only "automatic" function that FirJs does to you is the node removal, but this operation can be suppress implementing the `onNodeRemoveRequest` function (for example if you want to provide your custom logic). In this case you have to manually update the tree.

When you implement your drag&drop logic, you have to inform the Workspace, simply with a code like this:
```
ws.startDrag(event.target, {
    x: event.pageX,
    y: event.pageY,
}, {
    id: i++,
    type: element.dataset.type,
    label: `New node ${i}`, // Optional
});
```

### Other functions:
- `fitAndCenter(): void`: Call it to fit and center the tree (omg really?)
- `setTree(tree: Node[], preservePositionAndScale: boolean = false): void`: Call it to set the tree programmatically.

## Customizations
### Data customizations
FirJs provide this methods to override your data:
- `overrideLabel(node): string`: to override your label.
- `overrideIcon(node): string`: to assign a dynamic icon.

Both of this functions are executed when a node is drawed.

### Style customizations
You can customize the entire Workspace with only a little bit of CSS. You will find that there are many implemented CSS variables that you can simply override.

## Workspace tips
- Grab an empty point in the workspace with your **left mouse button** and move it to shift the workflow.
- If you want to move the workflow from any position, before to click press and hold the **Ctrl** or the **Space** button.
- Simply zoom with your **mouse wheel**.
- If you are dragging a node and do you want to cancel the drop operation, simply press **Esc**.

## Next steps
- [ ] Add tests.
- [ ] Angular module.
- [ ] React component.
- [ ] Better event management.
- [ ] More customizations.
- [ ] Better mobile.

## How to use this repo
Install the required dev dependencies with: `npm i`.

### Run demo while compiling (dev mode)
`npm run start`

Enjoy!

### Run demo only
`npm run run-demo`