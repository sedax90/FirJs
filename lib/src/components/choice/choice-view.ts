import { JoinView } from "../common/join/join-view";
import { DomHelper } from "../../utils/dom-helper";
import { ChoiceProps, Context, Node, Vector } from "../../models";
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
        readonly joinY: number,
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

        const placeholderWidth = context.options.style.placeholder.width;
        const placeholderHeight = context.options.style.placeholder.height;

        // Bottom circle icon
        const labelIcon = DomHelper.svg('g', {
            class: "map-label-icon",
        });
        labelIcon.appendChild(DomHelper.svg('circle', {
            r: 12,
            class: 'circle-label-icon',
            'stroke-width': 1.25,
        }));

        const iconSize = 20;
        labelIcon.appendChild(DomHelper.svg('image', {
            href: choiceIcon,
            width: iconSize,
            height: iconSize,
            x: -iconSize / 2,
            y: -iconSize / 2,
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
        const columnMargin = 10;
        const columnPadding = 15;
        const columnTopOffsetForLabel = placeholderHeight + placeholderHeight / 3;
        const direction = context.designerState.direction;

        let totalColumnsWidth = 0;
        let totalColumnsHeight = 0;
        let maxWidth = choiceLabelWidth;
        let maxHeight = choiceLabelHeight;

        // Preprocess columns
        const columnsMap: {
            sequence: Sequence,
            column: SVGElement,
            container: SVGElement,
            infoLabel: ChoiceLabel,
            width: number,
            height: number,
            joinX: number,
            joinY: number,
            offsetX: number,
            offsetY: number,
            hasTerminator: boolean,
        }[] = [];
        for (let i = 0; i < totalChoices; i++) {
            const nodes = props.choices[i] || [];

            const sequence = await Sequence.create(nodes, node, parentElement, context);
            if (!sequence) continue;

            sequences.push(sequence);

            let sequenceHeight = sequence.view.height;

            // Add padding
            sequenceHeight = sequenceHeight + (columnPadding * 2);

            const choiceColumn = DomHelper.svg('g', {
                class: `choice-column choice-column-index-${i}`,
            });
            const choiceColumnContainer = DomHelper.svg('g', {
                class: "choice-column-container",
            });
            const choiceInfoLabel = await ChoiceLabel.create(choiceColumnContainer, node, parentNode, i, context);

            let joinX = sequence.view.joinX;
            let sequenceWidth = sequence.view.width;

            // Add padding
            sequenceWidth = sequenceWidth + (columnPadding * 2);

            if (choiceInfoLabel.width > sequenceWidth) {
                sequenceWidth = choiceInfoLabel.width;
                joinX = sequenceWidth / 2;
            }

            let joinY = sequence.view.joinY;
            if (choiceInfoLabel.height > sequenceHeight) {
                sequenceHeight = choiceInfoLabel.height;
                joinY = sequenceHeight / 2;
            }

            totalColumnsWidth = totalColumnsWidth + sequenceWidth + columnMargin;
            totalColumnsHeight = totalColumnsHeight + sequenceHeight + columnMargin;

            columnsMap.push({
                sequence: sequence,
                column: choiceColumn,
                container: choiceColumnContainer,
                infoLabel: choiceInfoLabel,
                width: sequenceWidth,
                height: sequenceHeight,
                joinX: joinX,
                joinY: joinY,
                offsetX: 0,
                offsetY: 0,
                hasTerminator: false,
            });

            if (sequenceWidth > maxWidth) {
                maxWidth = sequenceWidth;
            }
            if (sequenceHeight > maxHeight) {
                maxHeight = sequenceHeight;
            }
        }

        let totalHeight = 0;

        const choicesContainerTopOffset = choiceLabelHeight + placeholderHeight;
        let previousOffsetX = 0;
        let previousOffsetY = 0;
        for (let i = 0; i < columnsMap.length; i++) {
            const column = columnsMap[i];
            const sequence = column.sequence;
            const choiceColumn = column.column;
            const choiceColumnContainer = column.container;
            const choiceInfoLabel = column.infoLabel;
            const totalNodesInSequence = sequence.nodes.length;

            const sequenceView = sequence.view;

            const choiceColumnBg = DomHelper.svg('rect', {
                class: "choice-column-bg",
                width: (direction === 'vertical') ? column.width : maxWidth + choiceInfoLabel.width + placeholderWidth,
                height: (direction === 'vertical') ? maxHeight : column.height,
                rx: 6,
            });
            choiceColumn.insertBefore(choiceColumnBg, choiceColumn.firstChild);

            choiceColumn.appendChild(choiceColumnContainer);
            choiceColumnContainer.appendChild(sequenceView.element);

            if (direction === 'vertical') {
                const columnWidthWithGutter = column.width + columnMargin;
                let columnOffset = -(totalColumnsWidth - previousOffsetX);

                DomHelper.translate(choiceColumn, columnOffset, 0);

                let sequenceOffsetX = totalNodesInSequence === 0 ? placeholderWidth / 2 : 0;
                DomHelper.translate(sequenceView.element, sequenceOffsetX, columnTopOffsetForLabel);

                // First connection
                if (totalNodesInSequence) {
                    const connectionHeight = columnTopOffsetForLabel;
                    JoinView.createConnectionJoin(choiceColumnContainer, { x: column.joinX, y: 0 }, connectionHeight, context);
                }

                // Add connection info
                const choiceInfoLabelOffsetX = (column.width - columnPadding * 2 - choiceInfoLabel.width) / 2;
                DomHelper.translate(choiceInfoLabel.element, choiceInfoLabelOffsetX, 0);

                const offsetX = previousOffsetX - totalColumnsWidth - columnMargin / 2;
                column.offsetX = offsetX;
                column.joinY = sequence.view.height;

                previousOffsetX = previousOffsetX + columnWidthWithGutter;

                DomHelper.translate(choiceColumnContainer, columnPadding, 0);
                DomHelper.translate(choiceColumnBg, 0, choiceLabelHeight / 4);
            }
            else {
                // TODO
                const columnHeightWithGutter = column.height + columnMargin;

                DomHelper.translate(choiceColumn, stepView.width + placeholderWidth, previousOffsetY);

                let sequenceOffsetY = totalNodesInSequence === 0 ? placeholderHeight / 2 : -(sequenceView.joinY - sequenceView.height / 2);
                DomHelper.translate(sequenceView.element, choiceInfoLabel.width + placeholderWidth, sequenceOffsetY);

                // First connection
                if (totalNodesInSequence) {
                    JoinView.createConnectionJoin(choiceColumnContainer, { x: choiceInfoLabel.width, y: column.height / 2 - columnPadding }, placeholderWidth, context);
                }

                // Add connection info
                const choiceInfoLabelOffsetY = (column.height - columnPadding * 2 - choiceInfoLabel.height) / 2;
                DomHelper.translate(choiceInfoLabel.element, 0, choiceInfoLabelOffsetY);

                const offsetY = previousOffsetY - totalColumnsHeight - columnMargin / 2;
                column.offsetY = offsetY;
                column.joinX = sequence.view.width;

                previousOffsetY = previousOffsetY + columnHeightWithGutter;

                DomHelper.translate(choiceColumnContainer, 0, columnPadding);
                DomHelper.translate(choiceColumnBg, choiceLabelHeight / 4, 0);

                totalHeight = totalHeight + column.height;
            }

            choicesContainer.appendChild(choiceColumn);

            if (totalNodesInSequence > 0) {
                const lastNode = sequence.nodes[totalNodesInSequence - 1];
                if (lastNode && lastNode.type === 'terminator') {
                    column.hasTerminator = true;
                }
            }
        }

        maxHeight = maxHeight + placeholderHeight;

        if (direction === 'vertical') {
            DomHelper.translate(choicesContainer, totalColumnsWidth + columnMargin / 2, choicesContainerTopOffset);

            if (totalColumnsWidth > maxWidth) {
                maxWidth = totalColumnsWidth;
            }
        }
        else {
            DomHelper.translate(choicesContainer, 0, 0);

            maxWidth = maxWidth + placeholderWidth + stepView.width + choiceLabelWidth;
        }

        let joinX = maxWidth / 2;
        let joinY = 0;

        if (direction === 'vertical') {
            const labelOffsetX = (maxWidth - choiceLabelWidth) / 2;
            DomHelper.translate(stepView.element, labelOffsetX, 0);
            totalHeight = choiceLabelHeight + maxHeight + placeholderHeight;
            joinY = maxHeight / 2;
        }
        else {
            totalHeight = totalHeight + choiceLabelHeight;
            joinY = totalHeight / 2;

            const labeloffsetY = (joinY - choiceLabelHeight / 2);
            DomHelper.translate(stepView.element, 0, labeloffsetY);
        }

        // Output connection dot
        const endConnection = DomHelper.svg('circle', {
            r: 5,
            cx: direction === 'vertical' ? joinX : maxWidth,
            cy: direction === 'vertical' ? totalHeight : joinY,
            class: 'output choicesContainerConnection',
            fill: "black",
            stroke: "black",
        });

        if (sequences.length > 1) {
            const firstJoinTargets: Vector[] = [];
            const lastJoinTargets: Vector[] = [];

            if (direction === 'vertical') {
                JoinView.createVerticalStraightJoin(element, { x: joinX, y: choicesContainerTopOffset - placeholderHeight }, placeholderHeight / 2);

                for (const column of columnsMap) {
                    const columnJoinX = column.offsetX + column.joinX + totalColumnsWidth + columnMargin + columnPadding;

                    firstJoinTargets.push({
                        x: columnJoinX,
                        y: choicesContainerTopOffset,
                    });

                    if (column.hasTerminator) continue;

                    lastJoinTargets.push({
                        x: columnJoinX,
                        y: column.joinY + choiceLabelHeight + placeholderHeight,
                    });
                }

                JoinView.createHorizontalJoins(element, { x: joinX, y: choicesContainerTopOffset - placeholderHeight / 2 }, firstJoinTargets);
                JoinView.createHorizontalJoins(element, { x: joinX, y: totalHeight }, lastJoinTargets);

                DomHelper.translate(labelIcon, stepView.width / 2, stepView.height);
            }
            else {
                // TODO
                JoinView.createHorizontalStraightJoin(element, { x: choiceLabelWidth, y: joinY }, placeholderWidth / 2);

                for (const column of columnsMap) {
                    const columnJoinY = totalHeight + column.offsetY + column.height / 2;

                    firstJoinTargets.push({
                        x: choiceLabelWidth + placeholderWidth,
                        y: columnJoinY,
                    });

                    if (column.hasTerminator) continue;

                    lastJoinTargets.push({
                        x: column.joinX + choiceLabelWidth + placeholderWidth,
                        y: columnJoinY,
                    });
                }

                JoinView.createVerticalJoins(element, { x: choiceLabelWidth + placeholderWidth / 2, y: joinY }, firstJoinTargets);
                JoinView.createVerticalJoins(element, { x: maxWidth, y: joinY }, lastJoinTargets);

                DomHelper.translate(labelIcon, stepView.width, stepView.height / 2);
            }
        }

        let choicesContainerBgWidth = choiceLabelWidth;
        if (maxWidth > choicesContainerBgWidth) {
            choicesContainerBgWidth = maxWidth;
        }

        choicesContainerBg.setAttribute('width', `${choicesContainerBgWidth}px`);
        choicesContainerBg.setAttribute('height', `${totalHeight}px`);

        if (direction === 'vertical') {
            const choicesContainerBgTopOffset = 10;
            DomHelper.translate(choicesContainerBg, -(totalColumnsWidth + columnMargin / 2), -choicesContainerTopOffset + choicesContainerBgTopOffset);
        }
        else {
            // TODO
        }

        element.appendChild(endConnection);
        element.appendChild(choicesContainer);
        element.appendChild(stepView.element);
        parentElement.appendChild(element);

        await addHasErrorIfNecessary(element, node, parentNode, context);

        const choiceView = new ChoiceView(element, parentElement, maxWidth, totalHeight, joinX, joinY, sequences);
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