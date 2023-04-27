import { ChoiceLabel } from "../components/choice/choice-label";
import { JoinView } from "../components/common/join/join-view";
import { NodeTreeView } from "../components/node-tree/node-tree-view";
import { Sequence } from "../components/sequence/sequence";
import { Context, Node, Vector } from "../models";
import { DomHelper } from "./dom-helper";
import { addHasErrorIfNecessary } from "./error-helper";

// export async function createTreeComponent(
//     node: Node,
//     parentNode: Node | null,
//     selectableElement: SVGElement,
//     containerElement: SVGElement,
//     parentElement: SVGElement,
//     columns: {
//         sequence: Sequence,
//         column: SVGElement,
//         container: SVGElement,
//         infoLabel: ChoiceLabel,
//         columnWidth: number;
//         columnHeight: number;
//         joinX: number,
//         joinY: number,
//         offsetX: number,
//         offsetY: number,
//         hasTerminator: boolean,
//     }[],
//     context: Context,
// ): Promise<NodeTreeView> {
//     const element = DomHelper.svg('g', {
//         class: "node-tree",
//     });

//     const flowMode = context.designerState.flowMode;

//     const placeholderWidth = context.options.style.placeholder.width;
//     const placeholderHeight = context.options.style.placeholder.height;

//     // TODO
//     const tempSvg = DomHelper.svg('svg');
//     tempSvg.appendChild(selectableElement);
//     document.body.appendChild(tempSvg);
//     const elementRect = selectableElement.getBoundingClientRect();
//     const choiceLabelWidth = elementRect.width;
//     const choiceLabelHeight = elementRect.height;
//     tempSvg.remove();

//     const choicesContainerTopOffset = choiceLabelHeight + placeholderHeight;

//     let totalColumnsWidth = 0;
//     let totalColumnsHeight = 0;

//     let maxWidth = choiceLabelWidth;
//     let maxHeight = choiceLabelHeight;

//     maxHeight = maxHeight + placeholderHeight;

//     const choicesContainer = DomHelper.svg('g', {
//         class: "choices-container",
//     });
//     const choicesContainerBg = DomHelper.svg('rect', {
//         class: "choices-container-bg",
//         stroke: "rgba(0, 0, 0, 0.5)",
//         rx: 6,
//         'stroke-dasharray': '3 7',
//     });

//     choicesContainer.appendChild(choicesContainerBg);

//     const columnPadding = 10;

//     const sequences = [];
//     for (const column of columns) {
//         const sequence = column.sequence;
//         sequences.push(sequence);

//         // Add padding
//         column.columnWidth = column.columnWidth + (columnPadding * 2);
//         column.columnHeight = column.columnHeight + (columnPadding * 2);
//         column.joinX = column.joinX + columnPadding;
//         column.joinY = column.joinY + columnPadding

//         if (flowMode === 'vertical') {
//             totalColumnsWidth = totalColumnsWidth + column.columnWidth;

//             if (column.columnHeight > maxHeight) {
//                 maxHeight = column.columnHeight;
//                 totalColumnsHeight = maxHeight;
//             }
//         }
//         else {
//             totalColumnsHeight = totalColumnsHeight + column.columnHeight;

//             if (column.columnWidth > maxWidth) {
//                 maxWidth = column.columnWidth;
//                 totalColumnsWidth = maxWidth;
//             }
//         }
//     }

//     let previousOffsetX = 0;
//     let previousOffsetY = 0;
//     for (let i = 0; i < columns.length; i++) {
//         const column = columns[i];
//         const sequence = column.sequence;
//         const choiceColumn = column.column;
//         const choiceColumnContainer = column.container;
//         const choiceInfoLabel = column.infoLabel;
//         const totalNodesInSequence = sequence.nodes.length;
//         const sequenceView = sequence.view;

//         const choiceColumnBg = DomHelper.svg('rect', {
//             class: "choice-column-bg",
//             width: (flowMode === 'vertical') ? column.columnWidth : maxWidth,
//             height: (flowMode === 'vertical') ? maxHeight : column.columnHeight,
//             rx: 6,
//         });

//         choiceColumn.insertBefore(choiceColumnBg, choiceColumn.firstChild);
//         choiceColumn.appendChild(choiceColumnContainer);
//         choiceColumnContainer.appendChild(sequenceView.element);

//         if (flowMode === 'vertical') {
//             const columnOffset = -(totalColumnsWidth - previousOffsetX);

//             DomHelper.translate(choiceColumn, columnOffset, 0);

//             const sequenceOffsetX = -(sequenceView.joinX - sequenceView.width / 2);
//             DomHelper.translate(sequenceView.element, sequenceOffsetX, placeholderHeight / 2);

//             // Add connection info
//             const choiceInfoLabelOffsetX = (column.columnWidth - columnPadding * 2 - choiceInfoLabel.width) / 2;
//             DomHelper.translate(choiceInfoLabel.element, choiceInfoLabelOffsetX, 0);

//             column.offsetX = previousOffsetX - totalColumnsWidth;

//             DomHelper.translate(choiceColumnContainer, columnPadding, 0);
//             DomHelper.translate(choiceColumnBg, 0, choiceLabelHeight / 4);

//             previousOffsetX = previousOffsetX + column.columnWidth;
//         }
//         else {
//             DomHelper.translate(choiceColumn, choiceLabelWidth + placeholderWidth, previousOffsetY);

//             const sequenceOffsetY = -(sequenceView.joinY - sequenceView.height / 2);
//             DomHelper.translate(sequenceView.element, choiceInfoLabel.width, sequenceOffsetY);

//             // Add connection info
//             const choiceInfoLabelOffsetY = (column.columnHeight - columnPadding * 2 - choiceInfoLabel.height) / 2;
//             DomHelper.translate(choiceInfoLabel.element, 0, choiceInfoLabelOffsetY);

//             column.offsetY = previousOffsetY - totalColumnsHeight;

//             DomHelper.translate(choiceColumnContainer, 0, columnPadding);
//             DomHelper.translate(choiceColumnBg, choiceLabelHeight / 4, 0);

//             previousOffsetY = previousOffsetY + column.columnHeight;
//         }

//         choicesContainer.appendChild(choiceColumn);

//         if (totalNodesInSequence > 0) {
//             const lastNode = sequence.nodes[totalNodesInSequence - 1];
//             if (lastNode && lastNode.type === 'terminator') {
//                 column.hasTerminator = true;
//             }
//         }
//     }

//     if (flowMode === 'vertical') {
//         DomHelper.translate(choicesContainer, totalColumnsWidth, choicesContainerTopOffset);

//         if (totalColumnsWidth > maxWidth) {
//             maxWidth = totalColumnsWidth;
//         }
//     }
//     else {
//         // DomHelper.translate(choicesContainer, 0, 0);
//         maxWidth = maxWidth + placeholderWidth + choiceLabelWidth + placeholderWidth;
//     }

//     let joinX = maxWidth / 2;
//     let joinY = 0;

//     if (flowMode === 'vertical') {
//         const labelOffsetX = (maxWidth - choiceLabelWidth) / 2;
//         DomHelper.translate(selectableElement, labelOffsetX, 0);
//         totalColumnsHeight = choiceLabelHeight + maxHeight + placeholderHeight;
//         joinY = maxHeight / 2;
//     }
//     else {
//         joinY = totalColumnsHeight / 2;

//         const labeloffsetY = (joinY - choiceLabelHeight / 2);
//         DomHelper.translate(selectableElement, 0, labeloffsetY);
//     }

//     // Output connection dot
//     const endConnection = DomHelper.svg('circle', {
//         r: 5,
//         cx: flowMode === 'vertical' ? joinX : maxWidth,
//         cy: flowMode === 'vertical' ? totalColumnsHeight : joinY,
//         class: 'output choicesContainerConnection',
//         fill: "black",
//         stroke: "black",
//     });

//     const firstJoinTargets: Vector[] = [];
//     const lastJoinTargets: Vector[] = [];

//     if (flowMode === 'vertical') {
//         JoinView.createVerticalStraightJoin(element, { x: joinX, y: choicesContainerTopOffset - placeholderHeight }, placeholderHeight / 2);

//         for (const column of columns) {
//             const columnJoinX = column.offsetX + column.joinX + totalColumnsWidth;

//             firstJoinTargets.push({
//                 x: columnJoinX,
//                 y: choicesContainerTopOffset,
//             });

//             if (column.hasTerminator) continue;

//             lastJoinTargets.push({
//                 x: columnJoinX,
//                 y: column.joinY + choiceLabelHeight + placeholderHeight / 2,
//             });
//         }

//         JoinView.createHorizontalJoins(element, { x: joinX, y: choicesContainerTopOffset - placeholderHeight / 2 }, firstJoinTargets);
//         JoinView.createHorizontalJoins(element, { x: joinX, y: totalColumnsHeight }, lastJoinTargets);

//         // DomHelper.translate(labelIcon, elementWidth / 2, stepView.height);
//     }
//     else {
//         JoinView.createHorizontalStraightJoin(element, { x: choiceLabelWidth, y: joinY }, placeholderWidth / 2);

//         for (const column of columns) {
//             const columnJoinY = column.offsetY + column.joinY + totalColumnsHeight;

//             firstJoinTargets.push({
//                 x: choiceLabelWidth + placeholderWidth,
//                 y: columnJoinY,
//             });

//             if (column.hasTerminator) continue;

//             lastJoinTargets.push({
//                 x: column.joinX + choiceLabelWidth,
//                 y: columnJoinY,
//             });
//         }

//         JoinView.createVerticalJoins(element, { x: choiceLabelWidth + placeholderWidth / 2, y: joinY }, firstJoinTargets);
//         JoinView.createVerticalJoins(element, { x: maxWidth, y: joinY }, lastJoinTargets);

//         // DomHelper.translate(labelIcon, elementWidth, stepView.height / 2);
//     }

//     let choicesContainerBgWidth = choiceLabelWidth;
//     if (maxWidth > choicesContainerBgWidth) {
//         choicesContainerBgWidth = maxWidth;
//     }

//     choicesContainerBg.setAttribute('width', `${choicesContainerBgWidth}px`);
//     choicesContainerBg.setAttribute('height', `${totalColumnsHeight}px`);

//     if (flowMode === 'vertical') {
//         const choicesContainerBgTopOffset = 10;
//         DomHelper.translate(choicesContainerBg, -(totalColumnsWidth), -choicesContainerTopOffset + choicesContainerBgTopOffset);
//     }
//     else {
//         // TODO
//     }

//     element.appendChild(endConnection);
//     element.appendChild(choicesContainer);
//     containerElement.appendChild(element);
//     containerElement.appendChild(selectableElement);

//     await addHasErrorIfNecessary(element, node, parentNode, context);

//     return new NodeTreeView(containerElement, parentElement, maxWidth, totalColumnsHeight, joinX, joinY, sequences);
// }