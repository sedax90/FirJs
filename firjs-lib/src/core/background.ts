import { ComponentWithView } from "../models";
import { BackgroundView } from "./background-view";

export class Background implements ComponentWithView {
    private constructor(
        readonly view: BackgroundView,
    ) { }

    public static create(parent: HTMLElement): Background {
        const view = BackgroundView.create(parent);
        return new Background(view);
    }
}