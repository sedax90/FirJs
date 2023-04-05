import { ClickInteraction, KeyboardInteraction, Vector, WheelInteraction } from "../models";
import { readMousePosition } from "../utils/event-utils";
import { subtract } from "../utils/vector-utils";

export class UserInteractionController {
    private _clickInteractionState!: ClickInteractionState;
    private _keyboardInteractionState!: KeyboardInteractionState;

    private readonly _onMouseMoveHandler = (e: MouseEvent) => this._onMouseMove(e);
    private readonly _onMouseUpHandler = (e: MouseEvent) => this._onMouseUp(e);
    private readonly _onKeyboardPressHandler = (e: KeyboardEvent) => this._onKeyPress(e);
    private readonly _onKeyboardReleaseHandler = (e: KeyboardEvent) => this._onKeyRelease(e);

    handleClickInteraction(interaction: ClickInteraction, startPosition: Vector): void {
        this._clickInteractionState = {
            userInteraction: interaction,
            startPosition: startPosition,
        };

        interaction.onStart(startPosition);

        window.addEventListener('mousemove', this._onMouseMoveHandler, false);
        window.addEventListener('mouseup', this._onMouseUpHandler, false);
    }

    handleWheelInteraction(interaction: WheelInteraction, event: WheelEvent): void {
        interaction.onWheel(event.deltaY);
    }

    handleDragInteraction(userInteraction: ClickInteraction, startPosition: Vector): void {
        this._clickInteractionState = {
            userInteraction: userInteraction,
            startPosition: startPosition,
        };

        userInteraction.onStart(startPosition);

        // We must listen on draover event because Firefox doens't emit mouse coordinates on drag event (https://bugzilla.mozilla.org/show_bug.cgi?id=505521)
        window.addEventListener('dragover', this._onMouseMoveHandler, false);
        window.addEventListener('dragend', this._onMouseUpHandler, false);
    }

    handleKeyboardInteraction(userInteraction: KeyboardInteraction): void {
        this._keyboardInteractionState = {
            keyboardInteraction: userInteraction,
        };

        window.addEventListener('keydown', this._onKeyboardPressHandler, false);
        window.addEventListener('keyup', this._onKeyboardReleaseHandler, false);
    }

    private _onMouseMove(e: MouseEvent): void {
        e.preventDefault();

        const currentPosition = readMousePosition(e);
        const delta = subtract(this._clickInteractionState.startPosition, currentPosition);

        const moveInteraction = this._clickInteractionState.userInteraction.onMove(delta);
        if (moveInteraction) {
            // Stop previous interaction
            this._clickInteractionState.userInteraction.onEnd();

            // Start a new interaction
            this._clickInteractionState.userInteraction = moveInteraction;
            this._clickInteractionState.startPosition = currentPosition;
            this._clickInteractionState.userInteraction.onStart(this._clickInteractionState.startPosition);
        }
    }

    private _onMouseUp(e: MouseEvent): void {
        e.preventDefault();

        window.removeEventListener('mousemove', this._onMouseMoveHandler, false);
        window.removeEventListener('drag', this._onMouseMoveHandler, false);

        this._clickInteractionState.userInteraction.onEnd();
    }

    private _onKeyPress(e: KeyboardEvent): void {
        this._keyboardInteractionState.keyboardInteraction.onPress(e);
    }

    private _onKeyRelease(e: KeyboardEvent): void {
        this._keyboardInteractionState.keyboardInteraction.onRelease(e);
    }
}

interface ClickInteractionState {
    userInteraction: ClickInteraction;
    startPosition: Vector;
}

interface KeyboardInteractionState {
    keyboardInteraction: KeyboardInteraction;
}