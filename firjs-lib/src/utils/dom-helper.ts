import { Attributes } from "../models";

export class DomHelper {
    public static svg<K extends keyof SVGElementTagNameMap>(name: K, attributes?: Attributes): SVGElementTagNameMap[K] {
        const element = document.createElementNS("http://www.w3.org/2000/svg", name);

        if (attributes) {
            DomHelper.attributes(element, attributes);
        }

        return element;
    }

    public static element<K extends keyof HTMLElementTagNameMap>(name: K, attributes?: Attributes): HTMLElementTagNameMap[K] {
        const el = document.createElement(name);

        if (attributes) {
            DomHelper.attributes(el, attributes);
        }

        return el;
    }

    public static attributes(element: Element, attributes: Attributes): void {
        for (const key of Object.keys(attributes)) {
            const value = attributes[key];

            element.setAttribute(key, (typeof value === 'string') ? value : value.toString());
        }
    }

    public static translate(element: Element, x: number, y: number): void {
        element.setAttribute('transform', `translate(${x}, ${y})`);
    }
}