import { Context, ContextMenu, Vector } from "../../../models";
import { ContextMenuView } from "./context-menu-view";

export class ComponentContextMenuView implements ContextMenu {
    private constructor() { }

    contextMenu!: ContextMenuView

    static create(position: Vector, context: Context, onRemoveAction: (e: MouseEvent) => void, onDuplicateAction: (e: MouseEvent) => void): ComponentContextMenuView {
        const componentContextMenu = new ComponentContextMenuView();

        const items = [
            {
                label: context.options.strings['context-menu.component.actions.remove.label'],
                action: onRemoveAction,
            },
            {
                label: context.options.strings['context-menu.component.actions.duplicate.label'],
                action: onDuplicateAction,
            }
        ];

        const contextMenu = ContextMenuView.create(position, items, context);
        componentContextMenu.contextMenu = contextMenu;

        return componentContextMenu;
    }

}