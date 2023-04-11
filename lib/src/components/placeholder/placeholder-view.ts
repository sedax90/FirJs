import { DomHelper } from "../../utils/dom-helper";
import { ComponentView, Context } from "../../models";
import { PlaceholderLabel } from "./placeholder-label";

const HOVER_CLASS = 'hover';
const NOT_ALLOWED_CLASS = 'not-allowed';
const DROPPABLE_CLASS = 'dropppable';

export class PlaceholderView implements ComponentView {
    public static width: number = 120;
    public static height: number = 40;

    private constructor(
        readonly element: SVGElement,
        readonly index: number,
        readonly context: Context,
        readonly width: number,
        readonly height: number,
        readonly joinX: number,
        readonly joinY: number,
    ) { }

    labelText!: string;

    private _placeholderGroup!: SVGElement;
    private _notAllowedLabel!: PlaceholderLabel;

    public static async create(parent: SVGElement, index: number, context: Context): Promise<PlaceholderView> {
        const element = DomHelper.svg('g', {
            class: 'placeholder-area',
            visibility: 'hidden',
        });
        parent.appendChild(element);

        const dropArea = DomHelper.svg('rect', {
            class: 'placeholder-drop-area',
            width: PlaceholderView.width,
            height: PlaceholderView.height,
        });
        element.appendChild(dropArea);

        const selector = DomHelper.svg('rect', {
            class: 'placeholder-selector',
            width: PlaceholderView.width,
            height: 5,
            y: PlaceholderView.height / 2,
            rx: 2,
        });
        element.appendChild(selector);

        const placeholderView = new PlaceholderView(element, index, context, PlaceholderView.width, PlaceholderView.height, PlaceholderView.width / 2, PlaceholderView.height / 2);
        placeholderView._placeholderGroup = element;
        return placeholderView;
    }

    showPlaceholder(): void {
        this._placeholderGroup.setAttribute('visibility', 'visible');
    }

    hidePlaceholder(): void {
        this._placeholderGroup.setAttribute('visibility', 'hidden');
    }

    setCanDrop(canDrop: boolean): void {
        this.resetCanDrop();

        if (canDrop) {
            this._placeholderGroup.classList.add(DROPPABLE_CLASS);
        }
        else {
            this._placeholderGroup.classList.remove(DROPPABLE_CLASS);
            this._addLabel();
        }
    }

    resetCanDrop(): void {
        this._placeholderGroup.classList.remove(NOT_ALLOWED_CLASS);
        this._clearLabel();
    }

    setHover(hover: boolean): void {
        if (hover) {
            this._placeholderGroup.classList.add(HOVER_CLASS);
        }
        else {
            this._placeholderGroup.classList.remove(HOVER_CLASS);
            this._clearLabel();
        }
    }

    private async _addLabel(): Promise<void> {
        this._placeholderGroup.classList.add(NOT_ALLOWED_CLASS);

        if (!this.labelText) return;

        const label = await PlaceholderLabel.create(this.element, this.labelText, this.index, this.context);
        this._notAllowedLabel = label;

        const labelOffsetX = (PlaceholderView.width - label.width) / 2;
        const labelOffsetY = (PlaceholderView.height - label.height) / 2;
        DomHelper.translate(label.element, labelOffsetX, labelOffsetY);
    }

    private _clearLabel(): void {
        const notAllowedLabel = this._notAllowedLabel;

        if (notAllowedLabel && this.element.contains(notAllowedLabel.element)) {
            this.element.removeChild(notAllowedLabel.element);
        }
    }

    getSelectableElement(): HTMLElement | SVGElement | null {
        return null;
    }
}