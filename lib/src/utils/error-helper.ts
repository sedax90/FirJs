import { Context, Node } from "../models";
import { DomHelper } from "./dom-helper";

export async function addHasErrorIfNecessary(element: SVGElement, node: Node, parentNode: Node | null, context: Context): Promise<void> {
    if (context.userDefinedFunctions?.hasError) {
        const hasError = await context.userDefinedFunctions.hasError({
            node: node,
            parent: parentNode,
        });

        if (hasError === true) {
            element.classList.add('has-error');
        }
    }
}