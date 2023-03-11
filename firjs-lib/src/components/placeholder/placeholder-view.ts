import { DomHelper } from "../../utils/dom-helper";
import { ComponentView } from "../../models";

export class PlaceholderView implements ComponentView {
    public static width: number = 100;
    public static height: number = 35;

    private constructor(
        readonly element: SVGElement,
        readonly width: number,
        readonly height: number,
        readonly joinX: number,
    ) { }

    private _placeholderGroup!: SVGElement;

    public static create(parent: SVGElement): PlaceholderView {
        const g = DomHelper.svg('g', {
            class: 'placeholder-area',
            opacity: 0,
        });
        parent.appendChild(g);

        g.appendChild(DomHelper.svg('rect', {
            class: 'placeholder-drop-area',
            width: PlaceholderView.width,
            height: PlaceholderView.height,
        }));

        g.appendChild(DomHelper.svg('rect', {
            class: 'placeholder-selector',
            width: PlaceholderView.width,
            height: 5,
            y: PlaceholderView.height / 2,
            rx: 4,
        }));

        const placeholderView = new PlaceholderView(g, PlaceholderView.width, PlaceholderView.height, PlaceholderView.width / 2);
        placeholderView._placeholderGroup = g;
        return placeholderView;
    }

    showPlaceholder(): void {
        this._placeholderGroup.style.opacity = "0.25";
    }

    hidePlaceholder(): void {
        this._placeholderGroup.style.opacity = "0";
    }

    toggleHover(value: boolean): void {
        if (value) {
            this._placeholderGroup.style.opacity = "1";
        }
        else {
            this._placeholderGroup.style.opacity = "0.25";
        }
    }
}