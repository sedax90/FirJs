import { DomHelper } from "../utils/dom-helper";
import { Vector, ElementView, Context } from "../models";
import { buttonIndexToType, MouseButton, readMousePosition } from "../utils/event-utils";
import { Background } from "./background";
import { Workflow } from "./workflow";

export class WorkspaceView implements ElementView {
    private constructor(
        readonly element: HTMLElement,
        readonly parent: HTMLElement,
        readonly context: Context,
    ) { }

    workflow!: Workflow;

    public static async create(parent: HTMLElement, context: Context): Promise<WorkspaceView> {
        const workspace = DomHelper.element('div', {
            id: "workspace-root",
            class: "workspace-root",
        });

        parent.appendChild(workspace);
        Background.create(workspace);
        const workflow = await Workflow.create(workspace, context);

        const wsv = new WorkspaceView(workspace, parent, context);
        wsv.workflow = workflow;
        return wsv;
    }

    public bindClick(handler: (position: Vector, target: Element, buttonIndex: MouseButton) => void) {
        this.element.addEventListener('mouseup', (e: MouseEvent) => {
            e.preventDefault();
            handler(readMousePosition(e), e.target as Element, buttonIndexToType(e.button));
        }, false);
    }

    public bindMouseDown(handler: (position: Vector, target: Element, buttonIndex: MouseButton) => void) {
        this.element.addEventListener('mousedown', (e: MouseEvent) => {
            e.preventDefault();
            handler(readMousePosition(e), e.target as Element, buttonIndexToType(e.button));
        }, false);
    }

    public bindContextMenu(handler: (position: Vector, target: Element) => void) {
        this.element.addEventListener('contextmenu', (e: MouseEvent) => {
            e.preventDefault();
            handler(readMousePosition(e), e.target as Element);
        }, false);
    }

    public bindWheel(handler: (e: WheelEvent) => void) {
        this.element.addEventListener("wheel", handler, false);
    }

    public bindKeyboard(handler: (e: KeyboardEvent) => void) {
        window.addEventListener('keydown', handler, false);
        window.addEventListener('keyup', handler, false);
    }
}