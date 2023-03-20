import { Context, ContextMenuItem, Vector } from "../../../models";
import { getVectorPositionInWorkspace } from "../../../utils/component-position-utils";
import { DomHelper } from "../../../utils/dom-helper";

export class ContextMenuView {
    private constructor(
        public element: HTMLElement,
        public items: ContextMenuItem[],
    ) { }

    public static create(position: Vector, items: ContextMenuItem[], context: Context): ContextMenuView {
        const contextMenuElement = DomHelper.element('div', {
            class: "context-menu",
        });
        contextMenuElement.style.position = 'absolute';

        const realPosition = getVectorPositionInWorkspace(position, context);
        contextMenuElement.style.left = realPosition.x + 'px';
        contextMenuElement.style.top = realPosition.y + 'px';

        const contextMenu = new ContextMenuView(contextMenuElement, items);
        const contextMenuItems = DomHelper.element('ul', {
            class: 'context-menu-items',
        });

        for (const item of items) {
            const menuItem = ContextMenuView._createMenuItem(item.label);
            contextMenuItems.append(menuItem);
            menuItem.addEventListener('mousedown', (e) => item.action(e), false);
        }

        contextMenuElement.append(contextMenuItems);

        return contextMenu;
    }

    private static _createMenuItem(label: string): HTMLElement {
        const item = DomHelper.element('li', {
            class: "context-menu-item",
        });
        item.append(label);

        return item;
    }
}