import { DomHelper } from "../../utils/dom-helper";
import { ChoiceProps, Context, Node } from "../../models";
import { Sequence } from "../sequence/sequence";
import choiceIcon from '../../assets/call_split.svg';
import { StepView } from "../common/step/step-view";
import { getNodeClasses } from "../../utils/node-utils";
import { ChoiceLabel as ChoiceLabel } from "./choice-label";
import { addHasErrorIfNecessary } from "../../utils/error-helper";
import { NodeTreeView } from "../node-tree/node-tree-view";
import { Branch, CreationHelper } from "../../utils/creation-helper";

export class ChoiceView extends NodeTreeView {
    public static async create(parentElement: SVGElement, node: Node, parentNode: Node | null, context: Context): Promise<ChoiceView> {
        let nodeTreeView!: NodeTreeView;

        if (context.userDefinedOverriders?.overrideView && context.userDefinedOverriders.overrideView?.choice) {
            nodeTreeView = await context.userDefinedOverriders.overrideView.choice({ node, parent: parentNode, parentElement, }, context) as NodeTreeView;
        }

        if (!nodeTreeView) {
            const element = DomHelper.svg('g', {
                class: "choice",
            });
            element.classList.add(...getNodeClasses(node));

            const stepView = await StepView.create(node, context);

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
            const flowMode = context.designerState.flowMode;

            if (flowMode === 'vertical') {
                DomHelper.translate(labelIcon, stepView.width / 2, stepView.height);
            }
            else {
                DomHelper.translate(labelIcon, stepView.width, stepView.height / 2);
            }

            // Columns creation
            const columns: Branch[] = [];
            for (let i = 0; i < totalChoices; i++) {
                const nodes = props.choices[i] || [];

                const choiceColumn = DomHelper.svg('g', {
                    class: `choice-column choice-column-index-${i}`,
                });
                const choiceColumnContainer = DomHelper.svg('g', {
                    class: "choice-column-container",
                });

                const sequence = await Sequence.create(nodes, node, choiceColumn, context);
                if (!sequence) continue;

                const choiceInfoLabel = await ChoiceLabel.create(choiceColumnContainer, node, parentNode, i, context);
                choiceColumn.insertBefore(choiceInfoLabel.element, choiceColumn.firstChild);

                let columnWidth = 0;
                let columnHeight = 0;
                let joinX = 0;
                let joinY = 0;

                if (flowMode === 'vertical') {
                    columnWidth = sequence.view.width;
                    columnHeight = sequence.view.height + choiceInfoLabel.height;

                    joinX = columnWidth / 2;
                    joinY = columnHeight - placeholderHeight;

                    const choiceInfoLabelOffsetX = (columnWidth - choiceInfoLabel.width) / 2;
                    DomHelper.translate(choiceInfoLabel.element, choiceInfoLabelOffsetX, 0);
                    DomHelper.translate(sequence.view.element, 0, choiceInfoLabel.height);
                }
                else {
                    columnWidth = sequence.view.width + choiceInfoLabel.width + placeholderWidth;
                    columnHeight = sequence.view.height;

                    joinX = columnWidth - placeholderWidth;

                    if (nodes.length === 0) {
                        joinX = joinX - placeholderWidth;
                    }

                    joinY = columnHeight / 2;

                    const choiceInfoLabelOffsetY = (columnHeight - choiceInfoLabel.height) / 2;
                    DomHelper.translate(choiceInfoLabel.element, 0, choiceInfoLabelOffsetY);
                    DomHelper.translate(sequence.view.element, choiceInfoLabel.width, 0);
                }

                columns.push({
                    sequence: sequence,
                    content: choiceColumn,
                    width: columnWidth,
                    height: columnHeight,
                    joinX: joinX,
                    joinY: joinY,
                });
            }

            element.appendChild(choicesContainerBg);

            const creationHelper = CreationHelper.getInstance(context) as CreationHelper;
            nodeTreeView = await creationHelper.createTreeComponent(
                node,
                parentNode,
                stepView.element,
                element,
                parentElement,
                columns,
            );

            choicesContainerBg.setAttribute('width', `${nodeTreeView.width}px`);
            choicesContainerBg.setAttribute('height', `${nodeTreeView.height}px`);

            if (flowMode === 'vertical') {
                const choicesContainerBgTopOffset = 10;
                DomHelper.translate(choicesContainerBg, 0, choicesContainerBgTopOffset);
            }
            else {
                // NOOP
            }

            nodeTreeView.selectableElement = stepView.element;
        }

        parentElement.appendChild(nodeTreeView.element);

        await addHasErrorIfNecessary(nodeTreeView.element, node, parentNode, context);

        return nodeTreeView;
    }
}