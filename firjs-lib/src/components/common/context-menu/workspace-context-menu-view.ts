import { Context, ContextMenu, Vector } from "../../../models";
import { ContextMenuView } from "./context-menu-view";

export class WorkspaceContextMenuView implements ContextMenu {
    private constructor() { }

    contextMenu!: ContextMenuView;

    static create(position: Vector, context: Context, onFitAndCenter: (e: MouseEvent) => void): WorkspaceContextMenuView {
        const componentContextMenu = new WorkspaceContextMenuView();

        const items = [
            {
                label: context.options.strings['context-menu.workspace.actions.fitandcenter.label'],
                action: onFitAndCenter,
            },
        ];

        const contextMenu = ContextMenuView.create(position, items, context);
        componentContextMenu.contextMenu = contextMenu;

        return componentContextMenu;
    }
}