import { ComponentInstance, Context } from "../../models";
import { ClickEvent } from "../../utils/event-utils";
import { Sequence } from "../sequence/sequence";
import { PlaceholderView } from "./placeholder-view";

export class Placeholder implements ComponentInstance {
    private constructor(
        readonly view: PlaceholderView,
        readonly context: Context,
        readonly index: number,
    ) { }

    parentSequence!: Sequence;

    findByClick(click: ClickEvent): ComponentInstance | null {
        return null;
    }

    static create(parent: SVGElement, context: Context, index: number): Placeholder {
        const view = PlaceholderView.create(parent);
        const placeholder = new Placeholder(view, context, index);
        context.designerState.placeholders?.push(placeholder);
        return placeholder;
    }

    show(): void {
        this.view.showPlaceholder();
    }

    hide(): void {
        this.view.hidePlaceholder();
    }

    setIsHover(value: boolean): void {
        this.view.toggleHover(value);
    }
}