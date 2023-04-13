import { Context, ContextMenu, ContextMenuItem, Vector } from "../../../models";
import { ContextMenuView } from "./context-menu-view";

export class ComponentContextMenuView implements ContextMenu {
    private constructor() { }

    contextMenu!: ContextMenuView

    static create(position: Vector, context: Context, actions: Record<string, ContextMenuItem>): ComponentContextMenuView {
        const componentContextMenu = new ComponentContextMenuView();
        const currentSelectedNodeInstance = context.designerState.selectedComponent.getValue();
        const node = currentSelectedNodeInstance?.node;

        const items: ContextMenuItem[] = [];

        for (const item of Object.values(actions)) {
            items.push({
                label: item.label,
                action: item.action,
                disabled: item.disabled
            });
        }

        const contextMenu = ContextMenuView.create(position, items, context);
        componentContextMenu.contextMenu = contextMenu;

        return componentContextMenu;
    }
}