import { Context, Node } from "../../models";
import { DomHelper } from "../../utils/dom-helper";
import { LabelView } from "../common/label/label-view";

export class ChoiceLabel {
    private constructor(
        readonly element: SVGElement,
        readonly width: number,
        readonly height: number,
    ) { }

    public static async create(parentElement: SVGElement, node: Node, parentNode: Node | null, columnIndex: number, context: Context): Promise<ChoiceLabel> {
        const height = 20;

        const element = DomHelper.svg('g', {
            class: `choice-label choice-label-index-${columnIndex}`,
        });

        let text: string;
        if (context.userDefinedOverriders?.overrideColumnLabel) {
            text = await context.userDefinedOverriders.overrideColumnLabel(node, parentNode, columnIndex);
        }
        else {
            text = `#${columnIndex + 1}`;
        }

        const label = LabelView.create(text, context, {
            class: [
                'choice-label-text',
            ]
        });

        const labelWidth = label.textLength + 20;
        const labelOffsetX = labelWidth / 2;
        const labelOffsetY = height / 2;

        DomHelper.translate(label.element, labelOffsetX, labelOffsetY);

        const background = DomHelper.svg('rect', {
            class: 'choice-label-background',
            width: labelWidth,
            height: height,
            rx: 10,
        });

        element.appendChild(background);
        element.appendChild(label.element);
        parentElement.appendChild(element);

        return new ChoiceLabel(element, labelWidth, height);
    }
}