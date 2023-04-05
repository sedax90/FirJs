import { JoinView } from "../common/join/join-view";
import { DomHelper } from "../../utils/dom-helper";
import { ComponentInstance, ComponentView, Context, Node } from "../../models";
import { Placeholder } from "../placeholder/placeholder";
import { PlaceholderView } from "../placeholder/placeholder-view";

export class SequenceView implements ComponentView {
    constructor(
        readonly element: SVGElement,
        readonly parent: SVGElement,
        readonly nodes: Node[],
        readonly width: number,
        readonly height: number,
        readonly joinX: number,
        readonly componentInstances: ComponentInstance[],
        readonly context: Context,
        readonly placeholders: Placeholder[],
    ) { }

    public static async create(parentElement: SVGElement, nodes: Node[], parentNode: Node | null, context: Context): Promise<SequenceView> {
        const element = DomHelper.svg('g', {
            class: "sequence nodes",
        });

        let maxWidth = 0;
        let maxJoinX = 0;
        const components: ComponentInstance[] = [];
        for (const node of nodes) {
            const component = await context.componentCreator.createComponent(node, parentNode, element, context);
            if (!component) continue;

            if (component.view.width > maxWidth) {
                maxWidth = component.view.width;
            }

            if (component.view.joinX > maxJoinX) {
                maxJoinX = component.view.joinX;
            }

            components.push(component);
        }

        const placeholders: Placeholder[] = [];
        let placeholder!: Placeholder;

        // Create first placeholder
        placeholder = await Placeholder.create(element, parentNode, context, 0);
        placeholders.push(placeholder);
        let offsetX = maxJoinX - PlaceholderView.width / 2;
        if (!maxJoinX && !parentNode) {
            // The sequence is empty and this is the only placeholder
            offsetX = 0;
        }
        DomHelper.translate(placeholder.view.element, offsetX, -PlaceholderView.height);

        const totalComponents = components.length;

        let sequenceHeight: number = 0;
        let lastTaskOffsetY = 0;
        for (let i = 0; i < totalComponents; i++) {
            const component = components[i];
            const nodeView = component.view;

            const offsetX = maxJoinX - component.view.joinX;

            // Center component
            DomHelper.translate(nodeView.element, offsetX, sequenceHeight);

            // Add join to previous element
            JoinView.createConnectionJoin(element, { x: maxJoinX, y: lastTaskOffsetY }, sequenceHeight - lastTaskOffsetY, context);

            sequenceHeight = sequenceHeight + nodeView.height;
            lastTaskOffsetY = sequenceHeight;

            placeholder = await Placeholder.create(element, parentNode, context, i + 1);
            placeholders.push(placeholder);
            DomHelper.translate(placeholder.view.element, maxJoinX - PlaceholderView.width / 2, sequenceHeight);
            sequenceHeight = sequenceHeight + placeholder.view.height;
        }

        if (totalComponents === 0) {
            maxWidth = PlaceholderView.width;
            maxJoinX = maxWidth / 2;
        }

        parentElement.appendChild(element);

        return new SequenceView(element, parentElement, nodes, maxWidth, sequenceHeight, maxJoinX, components, context, placeholders);
    }

    getSelectableElement(): HTMLElement | SVGElement | null {
        return null;
    }
}