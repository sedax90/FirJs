# FirJs

![](https://img.shields.io/github/license/sedax90/firjs)
![](https://img.shields.io/github/package-json/v/sedax90/firjs?color=%23f0db4f&filename=lib%2Fpackage.json&label=Vanilla%20JS&logo=javascript)
![](https://img.shields.io/github/package-json/v/sedax90/firjs?color=%23dd1b16&filename=angular%2Fprojects%2Fngx-firjs%2Fpackage.json&label=Angular&logo=angular)

![](https://user-images.githubusercontent.com/5001801/224503499-9dd881a7-028f-4b16-824b-b689770bdc0d.png)

> ⚠️ Note: This project is in a state of heavy development, please don't be offended if some things might change between releases.

## Demo 🚀️

|                |                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------- |
| **Vanilla JS** | [https://sedax90.github.io/firjs-github-io/](https://sedax90.github.io/firjs-github-io/) |

## About this project ℹ️

I state that this project is freely inspired by the amazing Sequential Workflow Designer: https://github.com/nocode-js/sequential-workflow-designer

**FirJs must not be intended as a ready to use project** but as a simple, generic, dependencies free library for drawing workflows (the only dependencies you will find are for compiling and running the demo).

This library is written entirely in Typescript and was born to remain simple and as agnostic as possible, so that it can be easily integrated into projects where needed.

## How to install 🥑️

|                |                            |
| -------------- | -------------------------- |
| **Vanilla JS** | `npm i @sedax90/firjs`     |
| **Angular**    | `npm i @sedax90/ngx-firjs` |

## Concepts 💡️

The main area is your **Workspace**. A _workspace_ contains a **Workflow**, who is simply a _nodes tree_.

FirJs provides these basic nodes:

- `task` (a generic operation)
- `map` (for/while)
- `choice` (if/switch)
- `terminator` (indicates that the flow ended before its natural end)

The workflow tree has a basic hierarchical structure:

```typescript
[
  {
    id: "123",
    type: "task",
    label: "Foo", // Optional
    icon: "star", // Optional
  },
  {
    id: "124",
    type: "map",
    props: {
      children: [],
    },
  },
];
```

You can attach all the data you need in the `props` field, they will always be kept.

## Getting started 🔥️

Import the library and create a simple JS object:

```typescript
firjs.init({
    parent: document.getElementById('root'),
    tree: [],
}).then((ws) => { // Enjoy! });
```

The library does not do anything automatically (except node removal), you have to use the exposed functions and events to adapt the library to your needs:

```typescript
onNodeAdd: (e: NodeAddeEvent) => void;
onNodeMove: (e: NodeMoveEvent) => void;
onNodeSelect: (e: NodeSelectEvent) => void;
onNodeDeselect: (e: NodeDeselectEvent) => void;
onNodeHover: (e: NodeHoverEvent) => void;
onNodeLeave: (e: NodeLeaveEvent) => void;
onNodeRemove: (e: NodeRemoveEvent) => void;
onTreeChange: (e: TreeChangeEvent) => void;
onWorkflowPan: (e: WorkflowPanEvent) => void;
onWorkflowScale: (e: WorkflowScaleEvent) => void;
onFlowModeChange: (e: FlowModeChangeEvent) => void;
```

You are not required to initialize event responses when creating the workflow as events are emitted as native Javascript events from the Workspace, so you can subscribe to them simply with:

```typescript
ws.addEventListener("nodeAdd", (event) => {
  // Your logic
});
```

FirJS emits these events:

- `nodeAdd`
- `nodeMove`
- `nodeSelect`
- `nodeDeselect`
- `nodeRemove`
- `nodeHover`
- `nodeLeave`
- `treeChange`
- `workflowPan`
- `workflowScale`
- `flowModeChange`

If you want to implement some logics during node drop or node remove, you can implement:

```typescript
// This is triggered whenever you move a node over a placeholder and allows you to override whether a node can be added to that placeholder or not (you can also add a custom message for the user if you want).
canDropNode: (e) =>
  Promise<{
    allowed: boolean;
    label?: string;
  }>;

// This is triggered when you release a node over a placeholder. It's the last chance for you to implement a custom logic for allow/disallow node attachment.
canAttachNode: (e) => Promise<boolean>;

// This is triggered before removing a node (with context menu or Del button).
canRemoveNode: (e) => Promise<boolean>;

// This is triggered before selecting a node.
canSelectNode: (e) => Promise<boolean>;

// This is triggered before deselecting a node.
canDeselectNode: (e) => Promise<boolean>;

// This is triggered before rendering a node. You can return a boolean indicating that node has an error (an `has-error` class will be applied to the node).
hasError: (e) => Promise<boolean>;
```

When you implement your drag&drop logic, you have to inform the Workspace that you are going to drop a node on the tree:

```typescript
event.dataTransfer.setData("text/plain", JSON.stringify(node));

ws.startDrag(
  event.target,
  {
    x: event.pageX,
    y: event.pageY,
  },
  {
    id: (i++).toString(),
    type: element.dataset.type,
    label: `New node ${i}`, // Optional
  }
);
```

After all, you can pass some options to init for customize some data:

```typescript
flowMode: "vertical" | "horizontal", // Default to 'vertical'
style: {
  fontSize: string;
  fontFamily: string;
};
strings: {
  "context-menu.component.actions.remove.label": string,
  "context-menu.workspace.actions.fitandcenter.label": string,
  "placeholder.not-allowed-to-drop.label": string,
}
```

### Other useful functions:

- `fitAndCenter(): void`: Fit and center the tree (omg really?)
- `setTree(tree: Node[], preservePositionAndScale: boolean = false): void`: Set the tree programmatically.
- `async draw(): Promise<void>`: Force a redraw without passing a new tree.
- `getFlowMode(): FlowMode`: Get the current flow mode
- `setFlowMode(mode: FlowMode): void`: Set a new flow flow mode

## Customizations 🎨️

### Advanced customizations

FirJs provide this methods to override your data:

```javascript
// to override your label.
overrideLabel(node: Node): Promise<string>;

// to assign a dynamic icon. If you return a string an <image> tag will be created with url as your string.
overrideIcon(node: Node): Promise<string>;

// to assign a label for each choice column.
overrideColumnLabel(node: Node, parent: Node | null, columnIndex: number): Promise<string | HtmlElement | SvgElement>;
```

All of this functions are executed when a node is drawed.

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
- [x] Angular module.
- [ ] React component.
- [x] Better event management.
- [ ] More customizations.
- [ ] Better mobile.
- [x] Horizontal mode

## How to use this repo 🛠️

Install the required dev dependencies with: `npm i`.

### Run demo while compiling (dev mode)

`npm run start`

Enjoy!

### Run demo only

`npm run run-demo`

## License

This project is released under the MIT license.
