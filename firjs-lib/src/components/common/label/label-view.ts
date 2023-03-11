import { DomHelper } from "../../../utils/dom-helper";
import { StepView } from "../step/step-view";

export class LabelView {
    public static defaultWidth: number = 200;

    public static create(text: string, props: LabelViewProps): SVGElement {
        let classes = ['label'];

        if (props.class) {
            classes = [
                ...classes,
                ...props.class,
            ];
        }

        const labelContainerWidth = props?.containerWidth ? props.containerWidth : LabelView.defaultWidth;
        const labelContainerHeight = props?.containerHeight ? props.containerHeight : StepView.height;

        const labelContainer = DomHelper.svg('svg', {
            class: "label-svg",
            width: '100%',
            height: labelContainerHeight,
        });

        const foreignObject = DomHelper.svg('foreignObject', {
            class: "label-foreign-obj",
            x: 0,
            y: 0,
            width: labelContainerWidth,
            height: labelContainerHeight,
        });
        const div = DomHelper.element('div', {
            class: "text-html",
            xmlns: "http://www.w3.org/1999/xhtml",
            style: `text-align: ${props?.textAlign ? props.textAlign : 'center'};`,
        });
        div.append(text);

        const label = DomHelper.svg("text", {
            class: classes.join(' '),
            stroke: props?.color ? props.color : "currentColor",
            fill: props?.color ? props.color : "currentColor",
            "text-anchor": "center",
            "dominant-baseline": "middle",
        });

        label.append(text);
        foreignObject.append(div);
        labelContainer.append(foreignObject);

        const parentG = DomHelper.svg('g', {
            class: "label-container",
        });
        parentG.appendChild(labelContainer);

        return parentG;
    }
}

export interface LabelViewProps {
    containerWidth?: number,
    containerHeight?: number,
    x?: number;
    y?: number;
    class?: string[];
    color?: string;
    textAlign?: string;
}