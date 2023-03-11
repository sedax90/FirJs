import { Vector } from "../models";

export function readMousePosition(e: MouseEvent): Vector {
    const vector: Vector = {
        x: e.clientX,
        y: e.clientY,
    }

    return vector;
}

export enum MouseButton {
    LEFT = 'LEFT', MIDDLE = 'MIDDLE', RIGHT = 'RIGHT', FOURTH = 'FOURTH', FIFTH = 'FIFTH'
}

export function buttonIndexToType(buttonIndex: number): MouseButton {
    switch (buttonIndex) {
        case 0: return MouseButton.LEFT;
        case 1: return MouseButton.MIDDLE;
        case 2: return MouseButton.LEFT;
        case 3: return MouseButton.FOURTH;
        case 4: return MouseButton.FIFTH;
        default: return MouseButton.LEFT;
    }
}

export interface ClickEvent {
    position: Vector;
    target: Element;
}