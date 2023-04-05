import { Context, ContextMenu, ContextMenuItem, Vector } from "../../../models";
import { ContextMenuView } from "./context-menu-view";

export class ComponentContextMenuView implements ContextMenu {
    private constructor() { }

    contextMenu!: ContextMenuView

    static create(position: Vector, context: Context, onRemoveAction: (e: MouseEvent) => void, onDuplicateAction: (e: MouseEvent) => void): ComponentContextMenuView {
        const componentContextMenu = new ComponentContextMenuView();
        const currentSelectedNodeInstance = context.designerState.selectedNode.getValue();
        const node = currentSelectedNodeInstance?.node;

        const items: ContextMenuItem[] = [
            {
                label: context.options.strings['context-menu.component.actions.remove.label'],
                action: onRemoveAction,
            },
            {
                label: context.options.strings['context-menu.component.actions.duplicate.label'],
                action: onDuplicateAction,
                disabled: (node && node.type === 'terminator'),
            }
        ];

        const contextMenu = ContextMenuView.create(position, items, context);
        componentContextMenu.contextMenu = contextMenu;

        return componentContextMenu;
    }

}