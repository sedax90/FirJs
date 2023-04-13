import { JoinView } from "../common/join/join-view";
import { DomHelper } from "../../utils/dom-helper";
import { ChoiceProps, Context, Node, Vector } from "../../models";
import { PlaceholderView } from "../placeholder/placeholder-view";
import { Sequence } from "../sequence/sequence";
import choiceIcon from '../../assets/call_split.svg';
import { StepView } from "../common/step/step-view";
import { getNodeClasses } from "../../utils/node-utils";
import { ChoiceLabel as ChoiceLabel } from "./choice-label";
import { addHasErrorIfNecessary } from "../../utils/error-helper";

export class ChoiceView {
    public constructor(
        readonly element: SVGElement,
        readonly parent: SVGElement,
        readonly width: number,
        readonly height: number,
        readonly joinX: number,
        readonly childSequences: Sequence[],
    ) { }

    private _selectableElement!: SVGElement;

    public static async create(parentElement: SVGElement, node: Node, parentNode: Node | null, context: Context): Promise<ChoiceView> {
        const element = DomHelper.svg('g', {
            class: "choice",
        });
        element.classList.add(...getNodeClasses(node));

        const stepView = await StepView.create(node, context);
        const choiceLabelWidth = stepView.width;
        const choiceLabelHeight = stepView.height;

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

        stepView.element.appendChild(labelIcon);

        // Create choices

        // Set choice total width
        let maxWidth = choiceLabelWidth;

        if (!node.props) {
            node.props = {
                choices: [],
            } as ChoiceProps;
        }

        const props = node.props as ChoiceProps;
        if (!props?.choices) {
            props.choices = [];
        }

        const choices = props.choices;
        if (!choices || choices.length < 2) {
            for (let i = choices.length; i < 2; i++) {
                choices.push([]);
            }
        }

        const totalChoices = (choices).length;

        const sequences: Sequence[] = [];
        let totalColumnsWidth = 0;
        const columnGutter = 50;
        let maxHeight = 0;

        // Preprocess columns
        const tmpColumnMap: {
            sequence: Sequence,
            column: SVGElement,
            infoLabel: ChoiceLabel,
            width: number,
            height: number,
            joinX: number,
            joinY: number,
            offsetX: number,
            hasTerminator: boolean,
        }[] = [];
        for (let i = 0; i < totalChoices; i++) {
            const nodes = props.choices[i] || [];

            const sequence = await Sequence.create(nodes, node, parentElement, context);
            if (!sequence) continue;

            sequences.push(sequence);

            const sequenceHeight = sequence.view.height;
            if (sequenceHeight > maxHeight) {
                maxHeight = sequenceHeight;
            }

            const choiceColumn = DomHelper.svg('g', {
                class: `choice-column choice-column-index-${i}`,
            });
            const choiceInfoLabel = await ChoiceLabel.create(choiceColumn, node, parentNode, i, context);

            let joinX = sequence.view.joinX;
            let sequenceWidth = sequence.view.width;

            if (choiceInfoLabel.width > sequenceWidth) {
                sequenceWidth = choiceInfoLabel.width;
                joinX = sequenceWidth / 2;
            }

            totalColumnsWidth = totalColumnsWidth + sequenceWidth + columnGutter;

            tmpColumnMap.push({
                sequence: sequence,
                column: choiceColumn,
                infoLabel: choiceInfoLabel,
                width: sequenceWidth,
                height: maxHeight,
                joinX: joinX,
                joinY: 0,
                offsetX: 0,
                hasTerminator: false,
            });
        }

        const choicesContainerTopOffset = choiceLabelHeight + PlaceholderView.height;
        let previousOffset = 0;
        for (let i = 0; i < tmpColumnMap.length; i++) {
            const tmpObj = tmpColumnMap[i];
            const sequence = tmpObj.sequence;
            const sequenceWidth = tmpObj.width;
            const choiceColumn = tmpObj.column;
            const choiceInfoLabel = tmpObj.infoLabel;
            const totalNodesInSequence = sequence.nodes.length;

            const columnWidthWithGutter = sequenceWidth + columnGutter;
            let columnOffset = -(totalColumnsWidth - previousOffset);

            const sequenceView = sequence.view;
            choiceColumn.appendChild(sequenceView.element);

            if (totalNodesInSequence === 0) {
                columnOffset = columnOffset + tmpObj.joinX;
            }
            DomHelper.translate(sequenceView.element, columnOffset, PlaceholderView.height);

            const columnJoinX = (previousOffset - totalColumnsWidth - columnGutter / 2) + columnWidthWithGutter / 2;

            // First connection
            if (totalNodesInSequence) {
                const connectionHeight = PlaceholderView.height + (PlaceholderView.height / 2);
                JoinView.createConnectionJoin(choiceColumn, { x: columnJoinX, y: -PlaceholderView.height / 2 }, connectionHeight, context);
            }

            // Add connection info
            const choiceInfoLabelOffsetX = columnJoinX - choiceInfoLabel.width / 2;
            DomHelper.translate(choiceInfoLabel.element, choiceInfoLabelOffsetX, -PlaceholderView.height / 4);

            const offsetX = previousOffset - totalColumnsWidth - columnGutter / 2;
            tmpObj.offsetX = offsetX;
            tmpObj.joinY = sequence.view.height;

            previousOffset = previousOffset + columnWidthWithGutter;

            choicesContainer.appendChild(choiceColumn);

            if (totalNodesInSequence > 0) {
                const lastNode = sequence.nodes[totalNodesInSequence - 1];
                if (lastNode && lastNode.type === 'terminator') {
                    tmpObj.hasTerminator = true;
                }
            }
        }

        maxHeight = maxHeight + PlaceholderView.height;

        if (totalColumnsWidth > maxWidth) {
            maxWidth = totalColumnsWidth;
        }

        DomHelper.translate(choicesContainer, totalColumnsWidth + columnGutter / 2, choicesContainerTopOffset);

        const choicesContainerBgTopOffset = 10;

        const labelOffsetX = (maxWidth - choiceLabelWidth) / 2;
        DomHelper.translate(stepView.element, labelOffsetX, 0);

        const totalHeight = choiceLabelHeight + maxHeight + PlaceholderView.height;
        const joinX = maxWidth / 2;

        // Output connection dot
        const endConnection = DomHelper.svg('circle', {
            r: 5,
            cx: joinX,
            cy: totalHeight,
            class: 'output choicesContainerConnection',
            fill: "black",
            stroke: "black",
        });

        if (sequences.length > 1) {
            const firstColumn = tmpColumnMap[0];
            const lastColumn = tmpColumnMap[tmpColumnMap.length - 1];

            const startX = firstColumn.joinX + columnGutter / 2;
            const endX = lastColumn.joinX + columnGutter / 2;

            // Start join line
            JoinView.createStraightJoin(element, { x: joinX, y: choicesContainerTopOffset - PlaceholderView.height }, PlaceholderView.height / 2);

            const firstJoinTargets: Vector[] = [];

            const lastJoinTargets: Vector[] = [];
            for (const column of tmpColumnMap) {
                const columnJoinX = column.offsetX + column.joinX + (totalColumnsWidth + columnGutter);

                firstJoinTargets.push({
                    x: columnJoinX,
                    y: choicesContainerTopOffset,
                });

                if (column.hasTerminator) continue;

                lastJoinTargets.push({
                    x: columnJoinX,
                    y: column.joinY + choiceLabelHeight + PlaceholderView.height,
                });
            }

            JoinView.createJoins(element, { x: joinX, y: choicesContainerTopOffset - PlaceholderView.height / 2 }, firstJoinTargets);
            JoinView.createJoins(element, { x: joinX, y: totalHeight }, lastJoinTargets);
        }

        let choicesContainerBgWidth = choiceLabelWidth;
        if (maxWidth > choicesContainerBgWidth) {
            choicesContainerBgWidth = maxWidth;
        }

        choicesContainerBg.setAttribute('width', `${choicesContainerBgWidth}px`);
        choicesContainerBg.setAttribute('height', `${totalHeight}px`);
        DomHelper.translate(choicesContainerBg, -(totalColumnsWidth + columnGutter / 2), -choicesContainerTopOffset + choicesContainerBgTopOffset);

        element.appendChild(endConnection);
        element.appendChild(choicesContainer);
        element.appendChild(stepView.element);
        parentElement.appendChild(element);

        await addHasErrorIfNecessary(element, node, parentNode, context);

        const choiceView = new ChoiceView(element, parentElement, maxWidth, totalHeight, joinX, sequences);
        choiceView._selectableElement = stepView.element;
        return choiceView;
    }

    setDragging(value: boolean): void {
        if (value) {
            this.element.classList.add('dragging');
        }
        else {
            this.element.classList.remove('dragging');
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

    getSelectableElement(): HTMLElement | SVGElement | null {
        return this._selectableElement;
    }
}