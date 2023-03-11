import { JoinView } from "../common/join/join-view";
import { DomHelper } from "../../utils/dom-helper";
import { ChoiceProps, Context, Node } from "../../models";
import { PlaceholderView } from "../placeholder/placeholder-view";
import { Sequence } from "../sequence/sequence";
import choiceIcon from '../../assets/call_split.svg';
import { StepView } from "../common/step/step-view";

export class ChoiceView {
    public constructor(
        readonly element: SVGElement,
        readonly parent: SVGElement,
        readonly width: number,
        readonly height: number,
        readonly joinX: number,
        readonly childSequences: Sequence[],
    ) { }

    private _choiceLabel!: SVGElement;

    public static create(parentElement: SVGElement, node: Node, context: Context): ChoiceView {
        const element = DomHelper.svg('g', {
            class: "choice",
        });

        const choiceLabelWidth = StepView.width;
        const choiceLabelHeight = StepView.height;

        // Bottom circle icon
        const labelIcon = DomHelper.svg('g', {
            class: "map-label-icon",
        });
        labelIcon.appendChild(DomHelper.svg('circle', {
            r: 12,
            cx: choiceLabelWidth / 2,
            cy: choiceLabelHeight + 2,
            class: 'circle-label-icon',
            'stroke-width': 1.25,
        }));

        const iconSize = 20;
        labelIcon.appendChild(DomHelper.svg('image', {
            href: choiceIcon,
            width: iconSize,
            height: iconSize,
            x: choiceLabelWidth / 2 - iconSize / 2,
            y: choiceLabelHeight + 2 - iconSize / 2,
        }));

        const choicesContainer = DomHelper.svg('g', {
            class: "choices-container",
        });
        const choicesContainerBg = DomHelper.svg('rect', {
            class: "choices-container-bg",
            stroke: "rgba(0, 0, 0, 0.5)",
            rx: 6,
            'stroke-dasharray': '3 7',
        });

        choicesContainer.appendChild(choicesContainerBg);

        const step = StepView.create(node, context);
        step.appendChild(labelIcon);

        // Create choices

        // Set choice total width
        let maxWidth = choiceLabelWidth;

        const props = node.props as ChoiceProps;
        const choices = props?.choices ? props.choices : [];

        let filteredChoices = choices.filter(e => e.length);
        let totalChoices = (filteredChoices).length;

        const sequences: Sequence[] = [];
        let totalColumnsWidth = 0;
        const columnGutter = 50;
        let maxHeight = 0;
        for (let i = 0; i < totalChoices; i++) {
            const nodes = props.choices[i];

            if (!nodes.length) continue;

            const sequence = Sequence.create(nodes, node, parentElement, context);
            if (!sequence) continue;

            sequences.push(sequence);
            totalColumnsWidth = totalColumnsWidth + sequence.view.width + columnGutter;

            const sequenceHeight = sequence.view.height;
            if (sequenceHeight > maxHeight) {
                maxHeight = sequenceHeight;
            }
        }

        const choicesContainerTopOffset = choiceLabelHeight + PlaceholderView.height;
        let previousOffset = 0;
        for (const sequence of sequences) {
            const choiceColumn = DomHelper.svg('g', {
                class: 'choice-column',
            });

            const columnWidth = sequence.view.width + columnGutter;
            const columnOffset = -(totalColumnsWidth - previousOffset);

            const sequenceView = sequence.view;
            choiceColumn.appendChild(sequenceView.element);
            DomHelper.translate(sequenceView.element, columnOffset, 0);

            const columnJoinX = (previousOffset - totalColumnsWidth - columnGutter / 2) + columnWidth / 2;

            // First connection
            JoinView.createConnectionJoin(choiceColumn, { x: columnJoinX, y: -PlaceholderView.height / 2 }, PlaceholderView.height / 2, context);

            // Last connection
            const joinHeight = maxHeight - sequence.view.height + PlaceholderView.height;
            JoinView.createStraightJoin(choiceColumn, { x: columnJoinX, y: sequence.view.height - PlaceholderView.height }, joinHeight, context);

            previousOffset = previousOffset + columnWidth;

            choicesContainer.appendChild(choiceColumn);
        }

        if (totalColumnsWidth > maxWidth) {
            maxWidth = totalColumnsWidth;
        }

        DomHelper.translate(choicesContainer, totalColumnsWidth + columnGutter / 2, choicesContainerTopOffset);

        const choicesContainerBgTopOffset = 10;

        const labelOffsetX = (maxWidth - choiceLabelWidth) / 2;
        DomHelper.translate(step, labelOffsetX, 0);

        const totalHeight = choiceLabelHeight + maxHeight + PlaceholderView.height;
        const joinX = maxWidth / 2;

        // Output connection dot
        const endConnection = DomHelper.svg('circle', {
            r: 6,
            cx: joinX,
            cy: totalHeight,
            class: 'output choicesContainerConnection',
            fill: "black",
            stroke: "black",
        });

        if (sequences.length > 1) {
            const firstColumn = sequences[0];
            const lastColumn = sequences[sequences.length - 1];

            const startX = firstColumn.view.joinX + columnGutter / 2;
            const endX = lastColumn.view.joinX + columnGutter / 2;

            // Start join line
            JoinView.createStraightJoin(element, { x: joinX, y: choicesContainerTopOffset - PlaceholderView.height }, PlaceholderView.height / 2, context);

            // Start horizontal line
            element.appendChild(DomHelper.svg('line', {
                class: "join-line",
                x1: startX,
                y1: choicesContainerTopOffset - PlaceholderView.height / 2,
                x2: maxWidth - endX,
                y2: choicesContainerTopOffset - PlaceholderView.height / 2,
            }));

            // End horizontal line
            element.appendChild(DomHelper.svg('line', {
                class: "join-line",
                x1: startX,
                y1: totalHeight,
                x2: maxWidth - endX,
                y2: totalHeight,
            }));
        }

        let choicesContainerBgWidth = choiceLabelWidth;
        if (maxWidth > choicesContainerBgWidth) {
            choicesContainerBgWidth = maxWidth;
        }
        choicesContainerBgWidth = choicesContainerBgWidth;

        choicesContainerBg.setAttribute('width', `${choicesContainerBgWidth}px`);
        choicesContainerBg.setAttribute('height', `${totalHeight}px`);
        DomHelper.translate(choicesContainerBg, -(totalColumnsWidth + columnGutter / 2), -choicesContainerTopOffset + choicesContainerBgTopOffset);

        element.appendChild(endConnection);
        element.appendChild(choicesContainer);
        element.appendChild(step);
        parentElement.appendChild(element);

        const choiceView = new ChoiceView(element, parentElement, maxWidth, totalHeight, joinX, sequences);
        choiceView._choiceLabel = step;
        return choiceView;
    }

    setDragging(value: boolean): void {
        if (value) {
            this.element.setAttribute('opacity', '0.25');
        }
        else {
            this.element.removeAttribute('opacity');
        }
    }

    setSelected(status: boolean): void {
        if (status) {
            this.element.classList.add('selected');
        }
        else {
            this.element.classList.remove('selected');
        }
    }
}