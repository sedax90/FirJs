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
        const columnPadding = 10;
        const flowMode = context.designerState.flowMode;

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
            columnWidth: number;
            columnHeight: number;
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

            const choiceColumn = DomHelper.svg('g', {
                class: `choice-column choice-column-index-${i}`,
            });
            const choiceColumnContainer = DomHelper.svg('g', {
                class: "choice-column-container",
            });
            const choiceInfoLabel = await ChoiceLabel.create(choiceColumnContainer, node, parentNode, i, context);

            let columnWidth = 0;
            let columnHeight = 0;
            let joinX = 0;
            let joinY = 0;

            if (flowMode === 'vertical') {
                columnWidth = sequence.view.width + (columnPadding * 2);
                columnHeight = sequence.view.height + choiceInfoLabel.height + (columnPadding * 2);

                joinX = columnWidth / 2;
                joinY = columnHeight - placeholderHeight;

                totalColumnsWidth = totalColumnsWidth + columnWidth;

                if (columnHeight > maxHeight) {
                    maxHeight = columnHeight;
                    totalColumnsHeight = maxHeight;
                }
            }
            else {
                columnWidth = sequence.view.width + choiceInfoLabel.width + placeholderWidth + (columnPadding * 2);
                columnHeight = sequence.view.height + (columnPadding * 2);

                joinX = columnWidth - placeholderWidth - (columnPadding * 2);

                if (nodes.length === 0) {
                    joinX = joinX - placeholderWidth;
                }

                joinY = columnHeight / 2;

                totalColumnsHeight = totalColumnsHeight + columnHeight;

                if (columnWidth > maxWidth) {
                    maxWidth = columnWidth;
                    totalColumnsWidth = maxWidth;
                }
            }

            columnsMap.push({
                sequence: sequence,
                column: choiceColumn,
                container: choiceColumnContainer,
                infoLabel: choiceInfoLabel,
                columnWidth: columnWidth,
                columnHeight: columnHeight,
                joinX: joinX,
                joinY: joinY,
                offsetX: 0,
                offsetY: 0,
                hasTerminator: false,
            });
        }

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
                width: (flowMode === 'vertical') ? column.columnWidth : maxWidth,
                height: (flowMode === 'vertical') ? maxHeight : column.columnHeight,
                rx: 6,
            });

            choiceColumn.insertBefore(choiceColumnBg, choiceColumn.firstChild);
            choiceColumn.appendChild(choiceColumnContainer);
            choiceColumnContainer.appendChild(sequenceView.element);

            if (flowMode === 'vertical') {
                const columnOffset = -(totalColumnsWidth - previousOffsetX);

                DomHelper.translate(choiceColumn, columnOffset, 0);

                const sequenceOffsetX = -(sequenceView.joinX - sequenceView.width / 2);
                DomHelper.translate(sequenceView.element, sequenceOffsetX, placeholderHeight / 2);

                // Add connection info
                const choiceInfoLabelOffsetX = (column.columnWidth - columnPadding * 2 - choiceInfoLabel.width) / 2;
                DomHelper.translate(choiceInfoLabel.element, choiceInfoLabelOffsetX, 0);

                column.offsetX = previousOffsetX - totalColumnsWidth;

                DomHelper.translate(choiceColumnContainer, columnPadding, 0);
                DomHelper.translate(choiceColumnBg, 0, choiceLabelHeight / 4);

                previousOffsetX = previousOffsetX + column.columnWidth;
            }
            else {
                DomHelper.translate(choiceColumn, stepView.width + placeholderWidth, previousOffsetY);

                const sequenceOffsetY = -(sequenceView.joinY - sequenceView.height / 2);
                DomHelper.translate(sequenceView.element, choiceInfoLabel.width, sequenceOffsetY);

                // Add connection info
                const choiceInfoLabelOffsetY = (column.columnHeight - columnPadding * 2 - choiceInfoLabel.height) / 2;
                DomHelper.translate(choiceInfoLabel.element, 0, choiceInfoLabelOffsetY);

                column.offsetY = previousOffsetY - totalColumnsHeight;

                DomHelper.translate(choiceColumnContainer, 0, columnPadding);
                DomHelper.translate(choiceColumnBg, choiceLabelHeight / 4, 0);

                previousOffsetY = previousOffsetY + column.columnHeight;
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

        if (flowMode === 'vertical') {
            DomHelper.translate(choicesContainer, totalColumnsWidth, choicesContainerTopOffset);

            if (totalColumnsWidth > maxWidth) {
                maxWidth = totalColumnsWidth;
            }
        }
        else {
            // DomHelper.translate(choicesContainer, 0, 0);
            maxWidth = maxWidth + placeholderWidth + stepView.width + placeholderWidth;
        }

        let joinX = maxWidth / 2;
        let joinY = 0;

        if (flowMode === 'vertical') {
            const labelOffsetX = (maxWidth - choiceLabelWidth) / 2;
            DomHelper.translate(stepView.element, labelOffsetX, 0);
            totalColumnsHeight = choiceLabelHeight + maxHeight + placeholderHeight;
            joinY = maxHeight / 2;
        }
        else {
            joinY = totalColumnsHeight / 2;

            const labeloffsetY = (joinY - choiceLabelHeight / 2);
            DomHelper.translate(stepView.element, 0, labeloffsetY);
        }

        // Output connection dot
        const endConnection = DomHelper.svg('circle', {
            r: 5,
            cx: flowMode === 'vertical' ? joinX : maxWidth,
            cy: flowMode === 'vertical' ? totalColumnsHeight : joinY,
            class: 'output choicesContainerConnection',
            fill: "black",
            stroke: "black",
        });

        const firstJoinTargets: Vector[] = [];
        const lastJoinTargets: Vector[] = [];

        if (flowMode === 'vertical') {
            JoinView.createVerticalStraightJoin(element, { x: joinX, y: choicesContainerTopOffset - placeholderHeight }, placeholderHeight / 2);

            for (const column of columnsMap) {
                const columnJoinX = column.offsetX + column.joinX + totalColumnsWidth;

                firstJoinTargets.push({
                    x: columnJoinX,
                    y: choicesContainerTopOffset,
                });

                if (column.hasTerminator) continue;

                lastJoinTargets.push({
                    x: columnJoinX,
                    y: column.joinY + choiceLabelHeight + placeholderHeight / 2,
                });
            }

            JoinView.createHorizontalJoins(element, { x: joinX, y: choicesContainerTopOffset - placeholderHeight / 2 }, firstJoinTargets);
            JoinView.createHorizontalJoins(element, { x: joinX, y: totalColumnsHeight }, lastJoinTargets);

            DomHelper.translate(labelIcon, stepView.width / 2, stepView.height);
        }
        else {
            JoinView.createHorizontalStraightJoin(element, { x: choiceLabelWidth, y: joinY }, placeholderWidth / 2);

            for (const column of columnsMap) {
                const columnJoinY = column.offsetY + column.joinY + totalColumnsHeight;

                firstJoinTargets.push({
                    x: choiceLabelWidth + placeholderWidth,
                    y: columnJoinY,
                });

                if (column.hasTerminator) continue;

                lastJoinTargets.push({
                    x: column.joinX + stepView.width,
                    y: columnJoinY,
                });
            }

            JoinView.createVerticalJoins(element, { x: choiceLabelWidth + placeholderWidth / 2, y: joinY }, firstJoinTargets);
            JoinView.createVerticalJoins(element, { x: maxWidth, y: joinY }, lastJoinTargets);

            DomHelper.translate(labelIcon, stepView.width, stepView.height / 2);
        }

        let choicesContainerBgWidth = choiceLabelWidth;
        if (maxWidth > choicesContainerBgWidth) {
            choicesContainerBgWidth = maxWidth;
        }

        choicesContainerBg.setAttribute('width', `${choicesContainerBgWidth}px`);
        choicesContainerBg.setAttribute('height', `${totalColumnsHeight}px`);

        if (flowMode === 'vertical') {
            const choicesContainerBgTopOffset = 10;
            DomHelper.translate(choicesContainerBg, -(totalColumnsWidth), -choicesContainerTopOffset + choicesContainerBgTopOffset);
        }
        else {
            // TODO
        }

        element.appendChild(endConnection);
        element.appendChild(choicesContainer);
        element.appendChild(stepView.element);
        parentElement.appendChild(element);

        await addHasErrorIfNecessary(element, node, parentNode, context);

        const choiceView = new ChoiceView(element, parentElement, maxWidth, totalColumnsHeight, joinX, joinY, sequences);
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