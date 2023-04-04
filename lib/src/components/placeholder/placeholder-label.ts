import { Context } from "../../models";
import { DomHelper } from "../../utils/dom-helper";
import { LabelView } from "../common/label/label-view";

export class PlaceholderLabel {
    private constructor(
        readonly element: SVGElement,
        readonly width: number,
        readonly height: number,
    ) { }

    public static async create(parentElement: SVGElement, text: string, columnIndex: number, context: Context): Promise<PlaceholderLabel> {
        const height = 20;

        const element = DomHelper.svg('g', {
            class: `placeholder-label placeholder-label-index-${columnIndex}`,
        });

        const label = LabelView.create(text, context, {
            class: [
                'placeholder-label-text',
            ]
        });

        const labelWidth = label.textLength + 20;
        const labelOffsetX = labelWidth / 2;
        const labelOffsetY = height / 2;

        DomHelper.translate(label.element, labelOffsetX, labelOffsetY);

        const background = DomHelper.svg('rect', {
            class: 'placeholder-label-background',
            width: labelWidth,
            height: height,
            rx: 10,
        });

        element.appendChild(background);
        element.appendChild(label.element);
        parentElement.appendChild(element);

        return new PlaceholderLabel(element, labelWidth, height);
    }
}