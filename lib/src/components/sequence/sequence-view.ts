import { JoinView } from "../common/join/join-view";
import { DomHelper } from "../../utils/dom-helper";
import { ComponentInstance, ComponentView, Context, Node } from "../../models";
import { Placeholder } from "../placeholder/placeholder";

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
        const flowMode = context.designerState.flowMode;
        const placeholderWidth = context.options.style.placeholder.width;
        const placeholderHeight = context.options.style.placeholder.height;

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
                maxJoinY = component.view.joinY;
            }

            components.push(component);
            index++;
        }

        const placeholders: Placeholder[] = [];
        let sequenceHeight: number = 0;
        let sequenceWidth: number = 0;

        // Create first placeholder
        const firstPlaceholder = await Placeholder.create(element, parentNode, context, 0);
        placeholders.push(firstPlaceholder);

        sequenceHeight = sequenceHeight + placeholderHeight;
        sequenceWidth = sequenceWidth + placeholderWidth;

        let offsetX = maxJoinX - placeholderWidth / 2;
        if (!maxJoinX && !parentNode || nodes.length === 0) {
            // The sequence is empty and this is the only placeholder
            offsetX = 0;
        }

        let offsetY = maxJoinY - placeholderHeight / 2;
        if (!maxJoinY && !parentNode || nodes.length === 0) {
            // The sequence is empty and this is the only placeholder
            offsetY = 0;
        }

        const totalComponents = components.length;

        if (flowMode === 'vertical') {
            DomHelper.translate(firstPlaceholder.view.element, offsetX, 0);
        }
        else {
            DomHelper.translate(firstPlaceholder.view.element, 0, offsetY);
        }

        let lastTaskOffsetX = 0;
        let lastTaskOffsetY = 0;

        const isInfinite = context.options.infinite;
        for (let i = 0; i < totalComponents; i++) {
            const component = components[i];
            const nodeView = component.view;

            if (flowMode === 'vertical') {
                const offsetX = maxJoinX - component.view.joinX;

                // Center component
                DomHelper.translate(nodeView.element, offsetX, sequenceHeight);

                if (!isInfinite || parentNode || i > 0) {
                    // Add join to previous element
                    JoinView.createConnectionJoin(element, { x: maxJoinX, y: lastTaskOffsetY }, sequenceHeight - lastTaskOffsetY, context);
                }
            }
            else {
                const offsetY = maxJoinY - component.view.joinY;

                // Center component
                DomHelper.translate(nodeView.element, sequenceWidth, offsetY);

                if (!isInfinite || parentNode || i > 0) {
                    // Add join to previous element
                    JoinView.createConnectionJoin(element, { x: lastTaskOffsetX, y: maxJoinY }, sequenceWidth - lastTaskOffsetX, context);
                }
            }

            sequenceWidth = sequenceWidth + nodeView.width;
            sequenceHeight = sequenceHeight + nodeView.height;

            lastTaskOffsetX = sequenceWidth;
            lastTaskOffsetY = sequenceHeight;

            const placeholder = await Placeholder.create(element, parentNode, context, i + 1);
            placeholders.push(placeholder);

            if (flowMode === 'vertical') {
                DomHelper.translate(placeholder.view.element, maxJoinX - placeholderWidth / 2, sequenceHeight);
                sequenceHeight = sequenceHeight + placeholderHeight;
            }
            else {
                DomHelper.translate(placeholder.view.element, sequenceWidth, maxJoinY - placeholderHeight / 2);
                sequenceWidth = sequenceWidth + placeholderWidth;
            }
        }

        if (totalComponents === 0) {
            sequenceWidth = placeholderWidth;
            sequenceHeight = placeholderHeight;
            maxWidth = placeholderWidth;
            maxHeight = placeholderHeight;
            maxJoinX = placeholderWidth / 2;
            maxJoinY = placeholderHeight / 2;

            if (nodes.length === 0) {
                // This is the only sequence in workflow
                firstPlaceholder.view.element.classList.add('alone');
            }
        }

        parentElement.appendChild(element);

        const width = (flowMode === 'vertical') ? maxWidth : sequenceWidth;
        const height = (flowMode === 'vertical') ? sequenceHeight : maxHeight;

        return new SequenceView(element, parentElement, nodes, width, height, maxJoinX, maxJoinY, components, context, placeholders);
    }

    getSelectableElement(): HTMLElement | SVGElement | null {
        return null;
    }
}