import { Vector, ComponentInstance, ComponentWithView, Context, ClickInteraction, WorkspaceInit, Node, WorkspaceStyleOptions } from "../models";
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

    static async init(options: WorkspaceInit): Promise<Workspace> {
        let defaultStyle: WorkspaceStyleOptions = {
            fontSize: "1em",
            fontFamily: 'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
        }

        const context: Context = {
            tree: options.tree,
            designerState: {
                placeholders: [],
                selectedNode: new Observable<ComponentInstance | null>(),
                deselectedNode: new Observable<ComponentInstance>,
                zoomLevel: 1,
            },
            style: {
                ...defaultStyle,
                ...options?.style,
            }
        };

        if (!context.userDefinedListeners) {
            context.userDefinedListeners = {};
        }

        if (options.onNodeSelect) {
            context.userDefinedListeners.onNodeSelect = options.onNodeSelect;
        }

        if (options.onNodeDeselect) {
            context.userDefinedListeners.onNodeDeselect = options.onNodeDeselect;
        }

        if (options.onNodeRemove) {
            context.userDefinedListeners.onNodeRemove = options.onNodeRemove;
        }

        if (options.onTreeChange) {
            context.userDefinedListeners.onTreeChange = options.onTreeChange;
        }

        if (options.onNodeRemoveRequest) {
            context.userDefinedListeners.onNodeRemoveRequest = options.onNodeRemoveRequest;
        }

        if (options.onNodeDropAllowed) {
            context.userDefinedListeners.onNodeDropAllowed = options.onNodeDropAllowed;
        }

        if (!context.userDefinedOverriders) {
            context.userDefinedOverriders = {};
        }

        if (options.overrideLabel) {
            context.userDefinedOverriders.overrideLabel = options.overrideLabel;
        }

        if (options.overrideIcon) {
            context.userDefinedOverriders.overrideIcon = options.overrideIcon;
        }

        const view = await WorkspaceView.create(options.parent, context);
        const workspace = new Workspace(view, context, options.parent);

        context.onDefinitionChange = workspace._onDefinitionChange.bind(workspace);

        context.designerState.workspaceRect = workspace.view.element.getBoundingClientRect();

        view.bindClick((position: Vector, target: Element, button: MouseButton) => workspace._onClick(position, target, button));
        view.bindWheel((e: WheelEvent) => workspace._onWheel(e));
        view.bindKeyboard((e: KeyboardEvent) => workspace._onKeyboard(e));

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

    private async _onDefinitionChange(tree: Node[], preservePositionAndScale: boolean = false): Promise<void> {
        this.context.tree = tree;

        if (!preservePositionAndScale) {
            this.context.designerState.workspacePosition = undefined;
            this.context.designerState.zoomLevel = 1;
        }

        this.parent.removeChild(this.view.element);
        const view = await WorkspaceView.create(this.parent, this.context);
        this.view = view;

        view.bindClick((position: Vector, target: Element, button: MouseButton) => this._onClick(position, target, button));
        view.bindWheel((e: WheelEvent) => this._onWheel(e));
        view.bindKeyboard((e: KeyboardEvent) => this._onKeyboard(e));

        if (this.context.userDefinedListeners?.onTreeChange) {
            this.context.userDefinedListeners.onTreeChange({
                tree: this.context.tree,
            });
        }
    }

    private _onClick(position: Vector, target: Element, button: MouseButton): void {
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
}