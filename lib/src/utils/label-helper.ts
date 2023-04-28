import { DomHelper } from "./dom-helper";

export class LabelHelper {
    static calculateLabelSize(label: SVGElement): {
        width: number;
        height: number;
        textLength: number;
    } {
        const temporarySvg = DomHelper.svg('svg', {
            class: "label-svg",
            width: '100%',
        });

        temporarySvg.appendChild(label.cloneNode(true));
        document.body.appendChild(temporarySvg);
        const textLength = (<SVGTextElement>temporarySvg.firstChild)?.getComputedTextLength();
        const rect = (<SVGTextElement>temporarySvg.firstChild)?.getBoundingClientRect();
        document.body.removeChild(temporarySvg);

        return {
            width: rect.width,
            height: rect.height,
            textLength: textLength,
        };
    }
}