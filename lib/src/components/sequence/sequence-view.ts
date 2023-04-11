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
        readonly joinY: number,
        readonly componentInstances: ComponentInstance[],
        readonly context: Context,
        readonly placeholders: Placeholder[],
    ) { }

    public static async create(parentElement: SVGElement, nodes: Node[], parentNode: Node | null, context: Context): Promise<SequenceView> {
        const direction = context.designerState.direction;

        const element = DomHelper.svg('g', {
            class: "sequence nodes",
        });

        let maxWidth = 0;
        let maxJoinX = 0;

        let maxHeight = 0;
        let maxJoinY = 0;
        const components: ComponentInstance[] = [];

        let index = 0;
        for (const node of nodes) {
            const component = await context.componentCreator.createComponent(node, parentNode, element, context);
            if (!component) continue;

            component.indexInSequence = index;

            if (component.view.width > maxWidth) {
                maxWidth = component.view.width;
            }

            if (component.view.joinX > maxJoinX) {
                maxJoinX = component.view.joinX;
            }

            if (component.view.height > maxHeight) {
                maxHeight = component.view.height;
            }

            if (component.view.joinY > maxJoinY) {
                maxJoinY = component.view.joinX;
            }

            components.push(component);
            index++;
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

        let offsetY = maxJoinY - PlaceholderView.height / 2;
        if (!maxJoinY && !parentNode) {
            // The sequence is empty and this is the only placeholder
            offsetY = 0;
        }

        if (direction === 'vertical') {
            DomHelper.translate(placeholder.view.element, offsetX, -PlaceholderView.height);
        }
        else {
            DomHelper.translate(placeholder.view.element, -PlaceholderView.width, offsetY);
        }

        const totalComponents = components.length;

        let sequenceHeight: number = 0;
        let sequenceWidth: number = 0;

        let lastTaskOffsetX = 0;
        let lastTaskOffsetY = 0;
        for (let i = 0; i < totalComponents; i++) {
            const component = components[i];
            const nodeView = component.view;

            const offsetX = maxJoinX - component.view.joinX;
            const offsetY = maxJoinY - component.view.joinY;

            // Center component
            if (direction === 'vertical') {
                DomHelper.translate(nodeView.element, offsetX, sequenceHeight);
            }
            else {
                DomHelper.translate(nodeView.element, sequenceWidth, offsetY);
            }

            // Add join to previous element
            if (direction === 'vertical') {
                JoinView.createConnectionJoin(element, { x: maxJoinX, y: lastTaskOffsetY }, sequenceHeight - lastTaskOffsetY, context);
            }
            else {
                JoinView.createConnectionJoin(element, { x: lastTaskOffsetX, y: maxJoinY }, sequenceWidth - lastTaskOffsetX, context);
            }

            sequenceHeight = sequenceHeight + nodeView.height;
            sequenceWidth = sequenceWidth + nodeView.width;

            lastTaskOffsetX = sequenceWidth;
            lastTaskOffsetY = sequenceHeight;

            placeholder = await Placeholder.create(element, parentNode, context, i + 1);
            placeholders.push(placeholder);

            if (direction === 'vertical') {
                DomHelper.translate(placeholder.view.element, maxJoinX - PlaceholderView.width / 2, sequenceHeight);
                sequenceHeight = sequenceHeight + placeholder.view.height;
            }
            else {
                DomHelper.translate(placeholder.view.element, sequenceWidth, maxJoinY - PlaceholderView.height / 2);
                sequenceWidth = sequenceWidth + placeholder.view.width;
            }
        }

        if (totalComponents === 0) {
            maxWidth = PlaceholderView.width;
            maxHeight = PlaceholderView.height;
            maxJoinX = maxWidth / 2;
            maxJoinY = maxHeight / 2;
        }

        parentElement.appendChild(element);

        return new SequenceView(element, parentElement, nodes, (direction === 'vertical') ? maxWidth : sequenceWidth, (direction === 'vertical') ? sequenceHeight : maxHeight, maxJoinX, maxJoinY, components, context, placeholders);
    }

    getSelectableElement(): HTMLElement | SVGElement | null {
        return null;
    }
}