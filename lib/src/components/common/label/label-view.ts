import { Context } from "../../../models";
import { DomHelper } from "../../../utils/dom-helper";
import { LabelHelper } from "../../../utils/label-helper";

export class LabelView {
    private constructor(
        public element: SVGElement,
        public textLength: number,
        public width: number,
        public height: number,
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
            "font-size": context.options.style.fontSize,
            'font-family': context.options.style.fontFamily,
        });
        label.append(text.trim());

        const parentG = DomHelper.svg('g', {
            class: "label-text-container",
        });

        parentG.appendChild(label);
        const labelSize = LabelHelper.calculateLabelSize(label);

        return new LabelView(parentG, labelSize.textLength, labelSize.width, labelSize.height);
    }
}

export interface LabelViewProps {
    class?: string[];
    color?: string;
}