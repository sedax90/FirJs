import { DomHelper } from "../../utils/dom-helper";
import { ComponentView, Context } from "../../models";
import { PlaceholderLabel } from "./placeholder-label";

const HOVER_CLASS = 'hover';
const NOT_ALLOWED_CLASS = 'not-allowed';
const DROPPABLE_CLASS = 'droppable';

export class PlaceholderView implements ComponentView {

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
        const flowMode = context.designerState.flowMode;
        const placeholderWidth = context.options.style.placeholder.width;
        const placeholderHeight = context.options.style.placeholder.height;

        const element = DomHelper.svg('g', {
            class: 'placeholder-area',
            visibility: 'hidden',
        });
        parent.appendChild(element);

        const dropArea = DomHelper.svg('rect', {
            class: 'placeholder-drop-area',
            width: placeholderWidth,
            height: placeholderHeight,
        });
        element.appendChild(dropArea);

        const selectorWidth = flowMode === 'vertical' ? placeholderWidth : 3;
        const selectorHeight = flowMode === 'vertical' ? 6 : placeholderHeight;
        const selector = DomHelper.svg('rect', {
            class: 'placeholder-selector',
            width: selectorWidth,
            height: selectorHeight,
            x: flowMode === 'vertical' ? 0 : (placeholderWidth - 3) / 2,
            y: flowMode === 'vertical' ? (placeholderHeight - 5) / 2 : 0,
            rx: 2,
        });

        element.appendChild(selector);

        const placeholderView = new PlaceholderView(element, index, context, placeholderWidth, placeholderHeight, placeholderWidth / 2, placeholderHeight / 2);
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
        const placeholderWidth = this.context.options.style.placeholder.width;
        const placeholderHeight = this.context.options.style.placeholder.height;

        this._placeholderGroup.classList.add(NOT_ALLOWED_CLASS);

        if (!this.labelText) return;

        const label = await PlaceholderLabel.create(this.element, this.labelText, this.index, this.context);
        this._notAllowedLabel = label;

        const labelOffsetX = (placeholderWidth - label.width) / 2;
        const labelOffsetY = (placeholderHeight - label.height) / 2;
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