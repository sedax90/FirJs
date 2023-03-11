import { ClickInteraction, ComponentInstance, Vector, Context } from "../models";
import { distance } from "../utils/vector-utils";
import { MoveComponentInteraction } from "./move-component-interaction";

export class SelectComponentInteraction implements ClickInteraction {
    private constructor(
        readonly componentInstance: ComponentInstance,
        readonly context: Context,
    ) { }

    private _offsetForDrag: number = 4;

    static create(
        componentInstance: ComponentInstance,
        context: Context,
    ): ClickInteraction {
        return new SelectComponentInteraction(componentInstance, context);
    }

    onStart(position: Vector): void {
        // NOOP
    }

    onMove(delta: Vector): void | ClickInteraction {
        if (distance(delta) > this._offsetForDrag) {
            if (this.componentInstance.view.setSelected) {
                this.componentInstance.view.setSelected(false);
            }

            return MoveComponentInteraction.create(this.componentInstance, this.context);
        }
    }

    onEnd(): void {
        // NOOP
    }
}