import { ComponentInstance, Context, Vector } from "../models";

export function getComponentPositionInWorkspace(component: ComponentInstance): Vector {
    return getElementPositionInWorkspace(component.view.element, component.context);
}

export function getElementPositionInWorkspace(element: HTMLElement | SVGElement, context: Context): Vector {
    const componentClientRect = element.getBoundingClientRect();

    let componentClientRectX = componentClientRect.x;
    let componentClientRectY = componentClientRect.y;

    const workspaceRect = context.designerState.workspaceRect;
    if (workspaceRect) {
        componentClientRectX = componentClientRectX - workspaceRect.left;
        componentClientRectY = componentClientRectY - workspaceRect.top;
    }

    return {
        x: componentClientRectX,
        y: componentClientRectY,
    };
}