import { DomHelper } from "../../../utils/dom-helper";

export class LabelContainer {
    public static create(props: LabelContainerProps): SVGElement {
        let classes = ['label-container'];

        if (props.class) {
            classes = [
                ...classes,
                ...props.class,
            ];
        }

        const container = DomHelper.svg("rect", {
            class: classes.join(' '),
            width: props.width,
            height: props.height,
            "stroke-width": "1",
            rx: 4,
            x: 0,
            y: 0,
        });

        return container;
    }
}

export interface LabelContainerProps {
    width: number;
    height: number;
    class?: string[],
}