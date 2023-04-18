import { Vector, ComponentInstance, ComponentWithView, Context, ClickInteraction, WorkspaceInit, Node, ComponentWithNode, WorkspaceOptions, WorkflowDirectionType } from "../models";
import { ClickEvent, MouseButton } from "../utils/event-utils";
import { SelectComponentInteraction } from "../interactions/select-component-interaction";
import { UserInteractionController } from "../interactions/user-interaction-controller";
import { WorkspaceView } from "./workspace-view";
import { Observable } from "../utils/observable";
import { WorkflowMoveInteraction } from "../interactions/workflow-move-interaction";
import { WorkflowScaleInteraction } from "../interactions/workflow-scale-interaction";
import { DragExternalInteraction } from "../interactions/drag-external-interaction";
import { DeleteKeyInteraction } from "../interactions/delete-key-interaction";
import { instanceOfComponentInstance, instanceOfComponentWithNode } from "../utils/interface-utils";
import { CtrlInteraction } from "../interactions/ctrl-interaction";
import { spacebarKey } from "../utils/keyboard-utils";
import { ComponentContextMenuView } from "../components/common/context-menu/component-context-menu-view";
import { removeNode } from "../utils/node-utils";
import { WorkspaceContextMenuView } from "../components/common/context-menu/workspace-context-menu-view";
import deepMerge from "../utils/object-utils";
import { EventEmitter } from "../events/event-emitter";
import { ComponentCreator } from "../utils/component-creator";
import { Placeholder } from "../components/placeholder/placeholder";
import { PlaceholderFinder } from "../utils/placeholder-finder";
import { EventSuppressor } from "../events/event-suppressor";

export class Workspace implements ComponentWithView {

    private constructor(
        public view: WorkspaceView,
        readonly context: Context,
        readonly parent: HTMLElement,
    ) {
        this._userInteractionController = new UserInteractionController();

        context.designerState?.selectedComponent.subscribe(
            (data: ComponentWithNode | null) => {
                const previousValue = context.designerState.selectedComponent.getPreviousValue();
                if (previousValue && previousValue !== data) {
                    EventEmitter.emitNodeDeselectEvent(this.view.workflow.view.element, {
                        node: previousValue.node,
                        parent: previousValue.parentNode,
                        index: instanceOfComponentInstance(previousValue) ? previousValue.indexInSequence : null,
                    });
                }

                if (data) {
                    EventEmitter.emitNodeSelectEvent(this.view.workflow.view.element, {
                        node: data.node,
                        parent: data.parentNode,
                        index: instanceOfComponentInstance(data) ? data.indexInSequence : null,
                    });
                }
            }
        );
    }

    // Public methods

    static async init(initData: WorkspaceInit): Promise<Workspace> {
        let options: WorkspaceOptions = Workspace._getDefaultOptions();
        if (initData.options) {
            options = deepMerge<WorkspaceOptions>(Workspace._getDefaultOptions(), initData.options);
        }

        options.style.placeholder = Workspace._getPlaceholderStyle(options.direction);

        const context: Context = {
            tree: initData.tree,
            designerState: {
                placeholders: [],
                selectedComponent: new Observable<ComponentWithNode | null>(),
                selectedPlaceholder: new Observable<Placeholder | null>(),
                scale: 1,
                direction: options.direction,
            },
            options: options,
            componentCreator: new ComponentCreator(),
        };

        if (!context.userDefinedEventListeners) {
            context.userDefinedEventListeners = {};
        }

        if (initData.onNodeAdd) {
            context.userDefinedEventListeners.onNodeAdd = initData.onNodeAdd;
        }

        if (initData.onNodeMove) {
            context.userDefinedEventListeners.onNodeMove = initData.onNodeMove;
        }

        if (initData.onNodeSelect) {
            context.userDefinedEventListeners.onNodeSelect = initData.onNodeSelect;
        }

        if (initData.onNodeDeselect) {
            context.userDefinedEventListeners.onNodeDeselect = initData.onNodeDeselect;
        }

        if (initData.onNodeRemove) {
            context.userDefinedEventListeners.onNodeRemove = initData.onNodeRemove;
        }

        if (initData.onWorkflowPan) {
            context.userDefinedEventListeners.onWorkflowPan = initData.onWorkflowPan;
        }

        if (initData.onWorkflowScale) {
            context.userDefinedEventListeners.onWorkflowScale = initData.onWorkflowScale;
        }

        if (initData.onTreeChange) {
            context.userDefinedEventListeners.onTreeChange = initData.onTreeChange;
        }

        if (!context.userDefinedFunctions) {
            context.userDefinedFunctions = {};
        }

        if (initData.onDirectionChange) {
            context.userDefinedFunctions.onDirectionChange = initData.onDirectionChange;
        }

        if (initData.canRemoveNode) {
            context.userDefinedFunctions.canRemoveNode = initData.canRemoveNode;
        }

        if (initData.canAttachNode) {
            context.userDefinedFunctions.canAttachNode = initData.canAttachNode;
        }

        if (initData.canDropNode) {
            context.userDefinedFunctions.canDropNode = initData.canDropNode;
        }

        if (initData.canSelectNode) {
            context.userDefinedFunctions.canSelectNode = initData.canSelectNode;
        }

        if (initData.canDeselectNode) {
            context.userDefinedFunctions.canDeselectNode = initData.canDeselectNode;
        }

        if (initData.hasError) {
            context.userDefinedFunctions.hasError = initData.hasError;
        }

        if (!context.userDefinedOverriders) {
            context.userDefinedOverriders = {};
        }

        if (initData.overrideLabel) {
            context.userDefinedOverriders.overrideLabel = initData.overrideLabel;
        }

        if (initData.overrideIcon) {
            context.userDefinedOverriders.overrideIcon = initData.overrideIcon;
        }

        if (initData.overrideColumnLabel) {
            context.userDefinedOverriders.overrideColumnLabel = initData.overrideColumnLabel;
        }

        const view = await WorkspaceView.create(initData.parent, context);
        const workspace = new Workspace(view, context, initData.parent);
        workspace._setViewBinds();
        workspace._addEventListeners();

        context.designerState.workspaceRect = workspace.view.element.getBoundingClientRect();

        workspace._rebuildPlaceholderCache();

        return workspace;
    }

    setTree(tree: Node[], preservePositionAndScale: boolean = false): void {
        this._onDefinitionChange(tree, preservePositionAndScale);
    }

    async setOptions(options: Partial<WorkspaceOptions>): Promise<void> {
        let combinedOptions: WorkspaceOptions = Workspace._getDefaultOptions();
        combinedOptions = deepMerge<WorkspaceOptions>(Workspace._getDefaultOptions(), options);

        this.context.options = combinedOptions;
        await this.draw();
    }

    async draw(suppressEvents: boolean = true): Promise<void> {
        const currentSelectedNodeInstance = this.context.designerState.selectedComponent.getValue();

        this.context.designerState.placeholders = [];

        this.parent.removeChild(this.view.element);
        const view = await WorkspaceView.create(this.parent, this.context);
        this.view = view;

        this._setViewBinds();
        this._addEventListeners();

        this._rebuildPlaceholderCache();

        // We have to restore the previous selected node if exists
        if (currentSelectedNodeInstance) {
            const nodeId = currentSelectedNodeInstance.node.id;
            const newInstance = this.view.workflow.findById(nodeId);
            if (newInstance && instanceOfComponentWithNode(newInstance)) {
                if (suppressEvents) {
                    const eventSuppressor = EventSuppressor.getInstance();
                    eventSuppressor.suppress('nodeDeselect');
                    eventSuppressor.suppress('nodeSelect');
                }

                this.context.designerState.selectedComponent.next(newInstance);
            }
        }
    }

    startDrag(element: HTMLElement | SVGElement, startPosition: Vector, node: Node): void {
        this.context.designerState.draggedNode = node;

        const dragDropInteraction = DragExternalInteraction.create(element, this.context);
        this._userInteractionController.handleDragInteraction(dragDropInteraction, startPosition);
    }

    fitAndCenter(): void {
        this.view.workflow.view.fitAndCenter();
    }

    getSelectedNode(): Node | null {
        const componentWithNode = this.context.designerState.selectedComponent.getValue();

        if (componentWithNode) {
            return componentWithNode.node;
        }

        return null;
    }

    setSelectedNode(value: Node | null): void {
        if (value) {
            const component = this.view.workflow.findById(value.id);
            if (component && instanceOfComponentWithNode(component)) {
                this.context.designerState.selectedComponent.next(component);
            }
        }

        this._deselectNode();
    }

    getDirection(): WorkflowDirectionType {
        return this.context.designerState.direction;
    }

    setDirection(direction: WorkflowDirectionType): void {
        this.context.designerState.direction = direction;
        this.context.options.style.placeholder = Workspace._getPlaceholderStyle(direction);

        EventEmitter.emitDirectionChangeEvent(this.view.element, {
            direction: direction,
        });
        this.draw().then(() => {
            this.fitAndCenter();
        });
    }

    private _userInteractionController!: UserInteractionController;

    private _setViewBinds(): void {
        this.view.bindMouseUp((position: Vector, target: Element, button: MouseButton) => this._onMouseUp(position, target, button));
        this.view.bindMouseDown((position: Vector, target: Element, button: MouseButton) => this._onMouseDown(position, target, button));
        this.view.bindWheel((e: WheelEvent) => this._onWheel(e));
        this.view.bindContextMenu((position: Vector, target: Element) => this._onContextMenu(position, target));
        this.view.bindKeyboard((e: KeyboardEvent) => this._onKeyboard(e));
    }

    private _addEventListeners(): void {
        const context = this.context;
        const workspaceViewElement = this.view.element;

        workspaceViewElement.addEventListener('treeChange', (event) => {
            if (context.userDefinedEventListeners?.onTreeChange) {
                context.userDefinedEventListeners.onTreeChange(event.detail);
            }

            this._onDefinitionChange(event.detail.tree, true);
            this._rebuildPlaceholderCache();
        });

        workspaceViewElement.addEventListener('nodeSelect', (event) => {
            if (context.userDefinedEventListeners?.onNodeSelect) {
                const data = event.detail;

                if (instanceOfComponentWithNode(data)) {
                    context.userDefinedEventListeners.onNodeSelect({
                        node: data.node,
                        parent: data.parent,
                        index: data.index,
                    });
                }

                const deleteKeyInteraction = DeleteKeyInteraction.create(this.context);
                this._userInteractionController.handleKeyboardInteraction(deleteKeyInteraction);
            }
        });

        workspaceViewElement.addEventListener('nodeDeselect', (event) => {
            if (context.userDefinedEventListeners?.onNodeDeselect) {
                const data = event.detail;

                if (instanceOfComponentWithNode(data)) {
                    context.userDefinedEventListeners.onNodeDeselect({
                        node: data.node,
                        parent: data.parent,
                        index: data.index,
                    });
                }
            }
        });

        workspaceViewElement.addEventListener('nodeMove', (event) => {
            const onNodeMoveCallback = context.userDefinedEventListeners?.onNodeMove;
            if (onNodeMoveCallback) {
                onNodeMoveCallback(event.detail);
            }

            EventEmitter.emitTreeChangeEvent(workspaceViewElement, {
                tree: context.tree
            });
        });

        workspaceViewElement.addEventListener('nodeAdd', (event) => {
            const onNodeAddCallback = context.userDefinedEventListeners?.onNodeAdd;
            if (onNodeAddCallback) {
                onNodeAddCallback(event.detail);
            }

            EventEmitter.emitTreeChangeEvent(workspaceViewElement, {
                tree: context.tree
            });
        });

        workspaceViewElement.addEventListener('nodeRemove', (event) => {
            if (context.userDefinedEventListeners?.onNodeRemove) {
                context.userDefinedEventListeners.onNodeRemove(event.detail);
            }

            EventEmitter.emitTreeChangeEvent(workspaceViewElement, {
                tree: context.tree
            });
        });

        workspaceViewElement.addEventListener('workflowPan', (event) => {
            if (context.userDefinedEventListeners?.onWorkflowPan) {
                context.userDefinedEventListeners.onWorkflowPan(event.detail);
            }

            this._rebuildPlaceholderCache();
        });

        workspaceViewElement.addEventListener('workflowScale', (event) => {
            if (context.userDefinedEventListeners?.onWorkflowScale) {
                context.userDefinedEventListeners.onWorkflowScale(event.detail);
            }

            this._rebuildPlaceholderCache();
        });

        workspaceViewElement.addEventListener('directionChange', (event) => {
            if (context.userDefinedFunctions?.onDirectionChange) {
                context.userDefinedFunctions.onDirectionChange(event.detail);
            }
        });
    }

    private async _onDefinitionChange(tree: Node[], preservePositionAndScale: boolean = false): Promise<void> {
        this.context.tree = tree;

        if (!preservePositionAndScale) {
            this.context.designerState.workflowPositionInWorkspace = undefined;
            this.context.designerState.scale = 1;
        }

        await this.draw();
    }

    private _onMouseUp(position: Vector, target: Element, button: MouseButton): void {
        // We have to check if the previous interaction was a node or worklow movement, in that case we have to skip the mouseup event
        if (this.context.designerState.wasMoving) {
            this.context.designerState.wasMoving = false;
            return;
        }

        if (button === MouseButton.LEFT || button === MouseButton.MIDDLE) {
            this._clearContextMenus();

            const workflow = this.view.workflow;
            const click: ClickEvent = {
                position: position,
                target: target,
            };

            let componentInstance!: ComponentInstance | null;
            if (!this.context.designerState.isPressingCtrl) {
                componentInstance = workflow.findByClick(click);

                if (componentInstance && instanceOfComponentWithNode(componentInstance)) {
                    // Select a node
                    const componentWithNode = componentInstance;

                    const previousSelectedComponent = this.context.designerState.selectedComponent.getValue();
                    if (previousSelectedComponent) {
                        // We have to check if we can deselect the previous component before
                        const canDeselectNodeFn = this.context.userDefinedFunctions?.canDeselectNode;
                        if (canDeselectNodeFn) {
                            canDeselectNodeFn({
                                node: previousSelectedComponent.node,
                                parent: previousSelectedComponent.parentNode,
                                index: instanceOfComponentInstance(previousSelectedComponent) ? previousSelectedComponent.indexInSequence : null,
                            }).then((result) => {
                                if (result === true) {
                                    this._deselectNode();
                                    this._selectNodeFlow(componentWithNode);
                                }
                            });
                        }
                        else {
                            this._deselectNode();
                            this._selectNodeFlow(componentWithNode);
                        }
                    }
                    else {
                        this._selectNodeFlow(componentWithNode);
                    }
                }
                else {
                    // Deselect a node
                    const previousSelectedNode = this.context.designerState?.selectedComponent.getValue();
                    if (previousSelectedNode) {

                        const canDeselectNodeFn = this.context.userDefinedFunctions?.canDeselectNode;
                        if (canDeselectNodeFn) {
                            canDeselectNodeFn({
                                node: previousSelectedNode.node,
                                parent: previousSelectedNode.parentNode,
                                index: instanceOfComponentInstance(previousSelectedNode) ? previousSelectedNode.indexInSequence : null,
                            }).then((result) => {
                                if (result === true) {
                                    this._deselectNode();
                                }
                            });
                        }
                        else {
                            this._deselectNode();
                        }
                    }
                }

                if (componentInstance) {
                    const userInteraction = SelectComponentInteraction.create(componentInstance, this.context);
                    this._userInteractionController.handleClickInteraction(userInteraction, position);
                }
            }
        }
    }

    private _selectNodeFlow(componentInstance: ComponentWithNode & ComponentInstance): void {
        const canSelectNodeFn = this.context.userDefinedFunctions?.canSelectNode;
        if (canSelectNodeFn) {
            canSelectNodeFn({
                node: componentInstance.node,
                parent: componentInstance.parentNode,
                index: componentInstance.indexInSequence,
            }).then((result) => {
                if (result === true) {
                    this.context.designerState?.selectedComponent.next(componentInstance);
                }
            });
        }
        else {
            this.context.designerState?.selectedComponent.next(componentInstance);
        }
    }

    private _deselectNode(): void {
        this.context.designerState.selectedComponent.next(null);
    }

    private _onMouseDown(position: Vector, target: Element, button: MouseButton): void {
        if (button === MouseButton.LEFT || button === MouseButton.MIDDLE) {
            const workflow = this.view.workflow;
            const click: ClickEvent = {
                position: position,
                target: target,
            };

            const componentInstance = workflow.findByClick(click);

            let userInteraction!: ClickInteraction;
            if (componentInstance && !this.context.designerState.isPressingCtrl) {
                if (instanceOfComponentWithNode(componentInstance)) {
                    this.context.designerState.draggedNode = componentInstance.node;
                }
                userInteraction = SelectComponentInteraction.create(componentInstance, this.context);
            }
            else {
                userInteraction = WorkflowMoveInteraction.create(workflow, this.context);
            }

            this._userInteractionController.handleClickInteraction(userInteraction, position);
        }
    }

    private _onContextMenu(position: Vector, target: Element): void {
        this._clearContextMenus();

        const workflow = this.view.workflow;
        const click: ClickEvent = {
            position: position,
            target: target,
        };
        const componentInstance = workflow.findByClick(click);

        let contextMenu!: any;
        if (componentInstance && instanceOfComponentWithNode(componentInstance)) {
            this.context.designerState?.selectedComponent.next(componentInstance);
            contextMenu = ComponentContextMenuView.create(position, this.context, {
                'remove': {
                    label: this.context.options.strings['context-menu.component.actions.remove.label'],
                    action: (e: MouseEvent) => this._onContextMenuRemoveAction(e, componentInstance),
                },
            });
        }
        else {
            this._deselectNode();
            contextMenu = WorkspaceContextMenuView.create(position, this.context, (e: MouseEvent) => this._onContextMenuFitAndCenter(e));
        }

        if (contextMenu) {
            this.view.element.appendChild(contextMenu.contextMenu.element);
        }
    }

    private _onWheel(e: WheelEvent): void {
        e.preventDefault();

        const userInteraction = WorkflowScaleInteraction.create(this.view.workflow, this.context);
        this._userInteractionController.handleWheelInteraction(userInteraction, e);
    }

    private _onKeyboard(e: KeyboardEvent): void {
        if (e.ctrlKey || spacebarKey(e)) {
            const interaction = CtrlInteraction.create(this.view.workflow, this.context);
            this._userInteractionController.handleKeyboardInteraction(interaction);
        }
    }

    private _clearContextMenus(): void {
        const contextMenus = document.body.querySelectorAll('.context-menu');
        contextMenus.forEach(e => {
            e.remove();
        });
    }

    private _onContextMenuRemoveAction(e: MouseEvent, componentInstance: ComponentInstance): void {
        e.preventDefault();
        removeNode(componentInstance, this.context);
    }

    private _onContextMenuFitAndCenter(e: MouseEvent): void {
        e.preventDefault();
        this.fitAndCenter();
    }

    private static _getDefaultOptions(): WorkspaceOptions {
        return {
            direction: "vertical",
            style: {
                fontSize: "1em",
                fontFamily: 'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
                placeholder: Workspace._getPlaceholderStyle('vertical'),
            },
            strings: {
                "context-menu.component.actions.remove.label": "Remove",
                "context-menu.workspace.actions.fitandcenter.label": "Fit and center",
                "placeholder.not-allowed-to-drop.label": "You can't attach a node here",
            }
        };
    }

    private _rebuildPlaceholderCache(): void {
        const placeholders = this.context.designerState.placeholders;
        if (placeholders != null) {
            const placeholderFinder = PlaceholderFinder.getInstance();
            placeholderFinder.buildCache(placeholders);
        }
    }

    private static _getPlaceholderStyle(direction: WorkflowDirectionType): { width: number, height: number } {
        if (direction === 'vertical') {
            return {
                width: 120,
                height: 40,
            };
        }
        else {
            return {
                width: 60,
                height: 60,
            };
        }
    }
}