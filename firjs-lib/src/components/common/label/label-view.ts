import { Context } from "../../../models";
import { DomHelper } from "../../../utils/dom-helper";

export class LabelView {
    private constructor(
        public element: SVGElement,
        public textLength: number,
    ) { }

    public static defaultWidth: number = 200;

    public static create(text: string, context: Context, props?: LabelViewProps): LabelView {
        let classes = ['label'];

        if (props?.class) {
            classes = [
                ...classes,
                ...props.class,
            ];
        }

        const label = DomHelper.svg("text", {
            class: classes.join(' '),
            stroke: props?.color ? props.color : "currentColor",
            fill: props?.color ? props.color : "currentColor",
            "text-anchor": "middle",
            "dominant-baseline": "middle",
            "font-size": context.style.fontSize,
            'font-family': context.style.fontFamily,
        });
        label.append(text.trim());

        const parentG = DomHelper.svg('g', {
            class: "label-text-container",
        });

        parentG.appendChild(label);
        const textLength = LabelView._calculateTextLenght(label);

        return new LabelView(parentG, textLength);
    }

    /**
     * This is a workaround to pre calculate the label size.
     */
    private static _calculateTextLenght(label: SVGElement): number {
        const temporarySvg = DomHelper.svg('svg', {
            class: "label-svg",
            width: '100%',
        });

        temporarySvg.appendChild(label.cloneNode(true));
        document.body.appendChild(temporarySvg);
        const textLength = (<SVGTextElement>temporarySvg.firstChild)?.getComputedTextLength();
        document.body.removeChild(temporarySvg);

        return textLength;
    }
}

export interface LabelViewProps {
    class?: string[];
    color?: string;
}