import { Vector, ComponentInstance, ComponentWithView, Context, ClickInteraction, WorkspaceInit, Node, WorkspaceInitOptions } from "../models";
import { ClickEvent, MouseButton } from "../utils/event-utils";
import { SelectComponentInteraction } from "../interactions/select-component-interaction";
import { UserInteractionController } from "../interactions/user-interaction-controller";
import { WorkspaceView } from "./workspace-view";
import { Observable } from "../utils/observable";
import { WorkflowMoveInteraction } from "../interactions/workflow-move-interaction";
import { WorkflowScaleInteraction } from "../interactions/workflow-scale-interaction";
import { DragExternalInteraction } from "../interactions/drag-external-interaction";
import { DeleteKeyInteraction } from "../interactions/delete-key-interaction";
import { instanceOfComponentWithNode } from "../utils/interface-utils";
import { CtrlInteraction } from "../interactions/ctrl-interaction";
import { spacebarKey } from "../utils/keyboard-utils";
import { ComponentContextMenuView } from "../components/common/context-menu/component-context-menu-view";
import { duplicateNode, removeNode } from "../utils/node-utils";
import { WorkspaceContextMenuView } from "../components/common/context-menu/workspace-context-menu-view";
import deepMerge from "../utils/object-utils";
import { EventEmitter } from "../events/event-emitter";
import { ComponentCreator } from "../utils/component-creator";

export class Workspace implements ComponentWithView {

    private constructor(
        public view: WorkspaceView,
        readonly context: Context,
        readonly parent: HTMLElement,
    ) {
        this._userInteractionController = new UserInteractionController();

        context.designerState?.selectedNode.subscribe(
            (data: ComponentInstance | null) => {
                if (data && context.userDefinedListeners?.onNodeSelect) {
                    if (instanceOfComponentWithNode(data)) {
                        context.userDefinedListeners.onNodeSelect({
                            node: data.node,
                            parent: data.parentNode,
                        });
                    }

                    const deleteKeyInteraction = DeleteKeyInteraction.create(this.context);
                    this._userInteractionController.handleKeyboardInteraction(deleteKeyInteraction);
                }
            }
        );

        context.designerState?.deselectedNode.subscribe(
            (data: ComponentInstance) => {
                if (context.userDefinedListeners?.onNodeDeselect) {
                    if (instanceOfComponentWithNode(data)) {
                        context.userDefinedListeners.onNodeDeselect({
                            node: data.node,
                            parent: data.parentNode,
                        });
                    }
                }
            }
        );
    }

    // Public methods

    static async init(initData: WorkspaceInit): Promise<Workspace> {
        let combinedOptions: WorkspaceInitOptions = Workspace._getDefaultOptions();
        if (initData.options) {
            combinedOptions = deepMerge<WorkspaceInitOptions>(Workspace._getDefaultOptions(), initData.options);
        }

        const context: Context = {
            tree: initData.tree,
            designerState: {
                placeholders: [],
                selectedNode: new Observable<ComponentInstance | null>(),
                deselectedNode: new Observable<ComponentInstance>,
                zoomLevel: 1,
            },
            options: combinedOptions,
            componentCreator: new ComponentCreator(),
        };

        if (!context.userDefinedListeners) {
            context.userDefinedListeners = {};
        }

        if (initData.onNodeAdd) {
            context.userDefinedListeners.onNodeAdd = initData.onNodeAdd;
        }

        if (initData.onNodeMove) {
            context.userDefinedListeners.onNodeMove = initData.onNodeMove;
        }

        if (initData.onNodeSelect) {
            context.userDefinedListeners.onNodeSelect = initData.onNodeSelect;
        }

        if (initData.onNodeDeselect) {
            context.userDefinedListeners.onNodeDeselect = initData.onNodeDeselect;
        }

        if (initData.onNodeRemove) {
            context.userDefinedListeners.onNodeRemove = initData.onNodeRemove;
        }

        if (initData.onTreeChange) {
            context.userDefinedListeners.onTreeChange = initData.onTreeChange;
        }

        if (initData.canRemoveNode) {
            context.userDefinedListeners.canRemoveNode = initData.canRemoveNode;
        }

        if (initData.canDropNode) {
            context.userDefinedListeners.canDropNode = initData.canDropNode;
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

        context.onDefinitionChange = workspace._onDefinitionChange.bind(workspace);
        context.designerState.workspaceRect = workspace.view.element.getBoundingClientRect();

        return workspace;
    }

    setTree(tree: Node[], preservePositionAndScale: boolean = false): void {
        if (this.context.onDefinitionChange) {
            this.context.onDefinitionChange(tree, preservePositionAndScale);
        }
    }

    startDrag(element: HTMLElement | SVGElement, startPosition: Vector, node: Node): void {
        this.context.designerState.tempNodeToDrop = node;

        const dragDropInteraction = DragExternalInteraction.create(element, this.context);
        this._userInteractionController.handleDragInteraction(dragDropInteraction, startPosition);
    }

    fitAndCenter(): void {
        this.view.workflow.view.fitAndCenter();
    }

    private _userInteractionController!: UserInteractionController;

    private _setViewBinds(): void {
        this.view.bindClick((position: Vector, target: Element, button: MouseButton) => this._onClick(position, target, button));
        this.view.bindWheel((e: WheelEvent) => this._onWheel(e));
        this.view.bindContextMenu((position: Vector, target: Element) => this._onContextMenu(position, target));
        this.view.bindKeyboard((e: KeyboardEvent) => this._onKeyboard(e));
    }

    private _addEventListeners(): void {
        const context = this.context;
        const workspaceViewElement = this.view.element;

        workspaceViewElement.addEventListener('treeChange', (event) => {
            if (context.onDefinitionChange) {
                context.onDefinitionChange(event.detail.tree, true);
            }
        });

        workspaceViewElement.addEventListener('nodeMove', (event) => {
            const onNodeMoveCallback = context.userDefinedListeners?.onNodeMove;
            if (onNodeMoveCallback) {
                onNodeMoveCallback(event.detail);
            }

            EventEmitter.emitTreeChangeEvent(workspaceViewElement, {
                tree: context.tree
            });
        });

        workspaceViewElement.addEventListener('nodeAdd', (event) => {
            const onNodeAddCallback = context.userDefinedListeners?.onNodeAdd;
            if (onNodeAddCallback) {
                onNodeAddCallback(event.detail);
            }

            EventEmitter.emitTreeChangeEvent(workspaceViewElement, {
                tree: context.tree
            });
        });

        workspaceViewElement.addEventListener('nodeRemove', (event) => {
            if (context.userDefinedListeners?.onNodeRemove) {
                context.userDefinedListeners.onNodeRemove(event.detail);
            }

            EventEmitter.emitTreeChangeEvent(workspaceViewElement, {
                tree: context.tree
            });
        })
    }

    private async _onDefinitionChange(tree: Node[], preservePositionAndScale: boolean = false): Promise<void> {
        this.context.tree = tree;

        if (!preservePositionAndScale) {
            this.context.designerState.workspacePosition = undefined;
            this.context.designerState.zoomLevel = 1;
        }

        this.parent.removeChild(this.view.element);
        const view = await WorkspaceView.create(this.parent, this.context);
        this.view = view;

        this._setViewBinds();
        this._addEventListeners();

        if (this.context.userDefinedListeners?.onTreeChange) {
            this.context.userDefinedListeners.onTreeChange({
                tree: this.context.tree,
            });
        }
    }

    private _onClick(position: Vector, target: Element, button: MouseButton): void {
        this._clearContextMenus();

        if (button === MouseButton.LEFT || button === MouseButton.MIDDLE) {
            const workflow = this.view.workflow;
            const click: ClickEvent = {
                position: position,
                target: target,
            };

            let componentInstance!: ComponentInstance | null;
            if (!this.context.designerState.isPressingCtrl) {
                componentInstance = workflow.findByClick(click);
                if (componentInstance) {
                    this.context.designerState?.selectedNode.next(componentInstance);
                }
                else {
                    const previousSelectedNode = this.context.designerState?.selectedNode.getValue();
                    if (previousSelectedNode) {
                        this.context.designerState?.deselectedNode.next(previousSelectedNode);
                        this.context.designerState.selectedNode.next(null);
                    }
                }
            }


            let userInteraction!: ClickInteraction;
            if (componentInstance && !this.context.designerState.isPressingCtrl) {
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
        if (componentInstance) {
            this.context.designerState?.selectedNode.next(componentInstance);
            contextMenu = ComponentContextMenuView.create(position, this.context, (e: MouseEvent) => this._onContextMenuRemoveAction(e, componentInstance), (e: MouseEvent) => this._onContextMenuDuplicateAction(e, componentInstance));
        }
        else {
            this.context.designerState?.selectedNode.next(null);
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

    private _onContextMenuDuplicateAction(e: MouseEvent, componentInstance: ComponentInstance): void {
        e.preventDefault();
        duplicateNode(componentInstance);
    }

    private _onContextMenuFitAndCenter(e: MouseEvent): void {
        e.preventDefault();
        this.fitAndCenter();
    }

    private static _getDefaultOptions(): WorkspaceInitOptions {
        return {
            style: {
                fontSize: "1em",
                fontFamily: 'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
            },
            strings: {
                "context-menu.component.actions.remove.label": "Remove",
                "context-menu.component.actions.duplicate.label": "Duplicate",
                "context-menu.workspace.actions.fitandcenter.label": "Fit and center"
            }
        };
    }
}