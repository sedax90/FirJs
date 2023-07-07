import { ComponentInstance, Context, Vector } from "../models";

export function getComponentPositionInWorkspace(component: ComponentInstance): Vector {
    return getElementPositionInWorkspace(component.view.element, component.context);
}

export function getElementPositionInWorkspace(element: HTMLElement | SVGElement, context: Context): Vector {
    const componentClientRect = element.getBoundingClientRect();

    let componentClientRectX = componentClientRect.x;
    let componentClientRectY = componentClientRect.y;

    const workspaceRect = context.designerState.getWorkspaceRect();
    if (workspaceRect) {
        componentClientRectX = componentClientRectX - workspaceRect.left;
        componentClientRectY = componentClientRectY - workspaceRect.top;
    }

    return {
        x: componentClientRectX,
        y: componentClientRectY,
    };
}

export function getVectorPositionInWorkspace(startPosition: Vector, context: Context): Vector {
    const workspaceRect = context.designerState.getWorkspaceRect();
    if (workspaceRect) {
        startPosition.x = startPosition.x - workspaceRect.left;
        startPosition.y = startPosition.y - workspaceRect.top;
    }

    return {
        x: startPosition.x,
        y: startPosition.y,
    };
}