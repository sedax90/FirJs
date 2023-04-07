import { Context, Vector } from "../models";

export function readMousePosition(e: MouseEvent | WheelEvent): Vector {
    const vector: Vector = {
        x: e.clientX,
        y: e.clientY,
    }

    return vector;
}

export function readMousePositionInWorkspace(e: MouseEvent | WheelEvent, context: Context): Vector {
    const mousePosition = readMousePosition(e);

    const workspaceRect = context.designerState.workspaceRect;
    if (workspaceRect) {
        mousePosition.x = mousePosition.x - workspaceRect.left;
        mousePosition.y = mousePosition.y - workspaceRect.top;
    }

    return mousePosition;
}

export enum MouseButton {
    LEFT = 'LEFT', MIDDLE = 'MIDDLE', RIGHT = 'RIGHT', FOURTH = 'FOURTH', FIFTH = 'FIFTH'
}

export function buttonIndexToType(buttonIndex: number): MouseButton {
    switch (buttonIndex) {
        case 0: return MouseButton.LEFT;
        case 1: return MouseButton.MIDDLE;
        case 2: return MouseButton.RIGHT;
        case 3: return MouseButton.FOURTH;
        case 4: return MouseButton.FIFTH;
        default: return MouseButton.LEFT;
    }
}

export interface ClickEvent {
    position: Vector;
    target: Element;
}