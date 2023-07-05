import { JoinView } from "../components/common/join/join-view";
import { LabelView, LabelViewProps } from "../components/common/label/label-view";
import { StepView } from "../components/common/step/step-view";
import { NodeTreeView } from "../components/node-tree/node-tree-view";
import { Sequence } from "../components/sequence/sequence";
import { TaskView } from "../components/task/task-view";
import { TerminatorView } from "../components/terminator/terminator-view";
import { ComponentView, Context, Node, Vector } from "../models";
import { DomHelper } from "./dom-helper";
import { addHasErrorIfNecessary } from "./error-helper";
import { subtract } from "./vector-utils";

export class CreationHelper {
    private static _instance: CreationHelper;

    constructor(private context: Context) { }

    static getInstance(context: Context): CreationHelper | null {
        let creationHelper = CreationHelper._instance;

        if (creationHelper) {
            return creationHelper;
        }

        if (context) {
            creationHelper = new CreationHelper(context);
            return creationHelper;
        }

        return null;
    }

    /**
     * StepView is the minimun basic component view.
     */
    async createStepView(node: Node): Promise<StepView> {
        return await StepView.create(node, this.context);
    }

    /**
     * A simple label view.
     */
    async createLabelView(text: string, props?: LabelViewProps): Promise<LabelView> {
        return await LabelView.create(text, this.context, props);
    }

    async createTaskComponent(node: Node, parentNode: Node | null, view: {
        element: SVGElement,
        parentElement: SVGElement,
        width: number,
        height: number,
        joinX: number,
        joinY: number,
    }): Promise<ComponentView> {
        return await TaskView.fromView(node, parentNode, view, this.context);
    }

    async createTerminatorComponent(node: Node, parentNode: Node | null, view: {
        element: SVGElement,
        parentElement: SVGElement,
        width: number,
        height: number,
        joinX: number,
        joinY: number,
    }): Promise<ComponentView> {
        return await TerminatorView.fromView(node, parentNode, view, this.context);
    }

    async createSequence(sequenceNodes: Node[], parentNode: Node | null, parentElement: SVGElement): Promise<Sequence> {
        return await Sequence.create(sequenceNodes, parentNode, parentElement, this.context);
    }

    async createTreeComponent(
        node: Node,
        parentNode: Node | null,
        selectableElement: SVGElement,
        containerElement: SVGElement,
        parentElement: SVGElement,
        branches: Branch[],
    ): Promise<NodeTreeView> {
        const element = DomHelper.svg('g', {
            class: "node-tree",
        });

        const context = this.context;
        const flowMode = context.designerState.flowMode;

        const placeholderWidth = context.options.style.placeholder.width;
        const placeholderHeight = context.options.style.placeholder.height;

        // TODO find a better way
        const tempSvg = DomHelper.svg('svg');
        tempSvg.appendChild(selectableElement);
        document.body.appendChild(tempSvg);
        const elementRect = selectableElement.getBoundingClientRect();
        const choiceLabelWidth = elementRect.width;
        const choiceLabelHeight = elementRect.height;
        tempSvg.remove();

        const choicesContainerTopOffset = choiceLabelHeight + placeholderHeight;

        let totalBranchesWidth = 0;
        let totalBranchesHeight = 0;

        let maxWidth = choiceLabelWidth;
        let maxHeight = choiceLabelHeight;

        maxHeight = maxHeight + placeholderHeight;

        const choicesContainer = DomHelper.svg('g', {
            class: "tree-container",
        });

        const padding = 10;
        const customJoinOrigins: Vector[] = [];
        const sequences = [];
        for (let i = 0; i < branches.length; i++) {
            const branch = branches[i];
            const sequence = branch.sequence;
            sequences.push(sequence);

            const branchElement = DomHelper.svg('g', {
                class: `tree-branch tree-branch-index-${i}`,
            });
            const branchElementContentContainer = DomHelper.svg('g', {
                class: "tree-branch-content-container",
            });

            branchElement.appendChild(branchElementContentContainer);
            branchElementContentContainer.appendChild(branch.content);
            branch.content = branchElement;

            // Add padding
            branch.width = branch.width + (padding * 2);
            branch.height = branch.height + (padding * 2);
            branch.joinX = branch.joinX + padding;
            branch.joinY = branch.joinY + padding;

            if (flowMode === 'vertical') {
                totalBranchesWidth = totalBranchesWidth + branch.width;

                if (branch.height > maxHeight) {
                    maxHeight = branch.height;
                    totalBranchesHeight = maxHeight;
                }

                // Center content with padding
                DomHelper.translate(branchElementContentContainer, padding, 0);
            }
            else {
                totalBranchesHeight = totalBranchesHeight + branch.height;

                if (branch.width > maxWidth) {
                    maxWidth = branch.width;
                    totalBranchesWidth = maxWidth;
                }

                // Center content with padding
                DomHelper.translate(branchElementContentContainer, 0, padding);
            }
        }

        const processedBranches: ProcessedBranch[] = [];

        let previousOffsetX = 0;
        let previousOffsetY = 0;

        if (flowMode === "vertical") {
            if (maxWidth > totalBranchesWidth) {
                previousOffsetX = (maxWidth - totalBranchesWidth) / 2;
            }
        }
        else {
            // NOOP
        }

        for (let i = 0; i < branches.length; i++) {
            const branch: ProcessedBranch = { ...branches[i], offsetX: 0, offsetY: 0, hasTerminator: false };
            const sequence = branch.sequence;
            const content = branch.content;
            const totalNodesInSequence = sequence.nodes.length;

            if (flowMode === 'vertical') {
                const contentOffsetX = previousOffsetX - totalBranchesWidth;
                DomHelper.translate(content, contentOffsetX, 0);

                branch.offsetX = contentOffsetX;
                previousOffsetX = previousOffsetX + branch.width;
            }
            else {
                DomHelper.translate(content, choiceLabelWidth + placeholderWidth, previousOffsetY);

                branch.offsetY = previousOffsetY - totalBranchesHeight;
                previousOffsetY = previousOffsetY + branch.height;
            }

            choicesContainer.appendChild(content);

            if (totalNodesInSequence > 0) {
                const lastNode = sequence.nodes[totalNodesInSequence - 1];
                if (lastNode && lastNode.type === 'terminator') {
                    branch.hasTerminator = true;
                }
            }

            processedBranches.push({ ...branch });
        }

        if (flowMode === 'vertical') {
            DomHelper.translate(choicesContainer, totalBranchesWidth, choicesContainerTopOffset);

            if (totalBranchesWidth > maxWidth) {
                maxWidth = totalBranchesWidth;
            }
        }
        else {
            maxWidth = maxWidth + placeholderWidth + choiceLabelWidth + placeholderWidth;
        }

        let joinX = maxWidth / 2;
        let joinY = 0;
        let labelOffsetX = 0;
        let labeloffsetY = 0;

        if (flowMode === 'vertical') {
            labelOffsetX = (maxWidth - choiceLabelWidth) / 2;
            DomHelper.translate(selectableElement, labelOffsetX, 0);
            totalBranchesHeight = choiceLabelHeight + maxHeight + placeholderHeight;
            joinY = maxHeight / 2;
        }
        else {
            joinY = totalBranchesHeight / 2;

            labeloffsetY = (joinY - choiceLabelHeight / 2);
            DomHelper.translate(selectableElement, 0, labeloffsetY);
        }

        for (const processedBranch of processedBranches) {
            if (processedBranch.origin) {
                let origin = processedBranch.origin;

                if (processedBranch.originRelativeToContainer) {
                    origin = subtract(origin, { x: -labelOffsetX, y: -labeloffsetY });
                }

                customJoinOrigins.push(origin);
            }
        }

        const firstJoinTargets: Vector[] = [];
        const lastJoinTargets: Vector[] = [];

        if (flowMode === 'vertical') {
            for (const processedBranch of processedBranches) {
                const branchJoinX = processedBranch.offsetX + processedBranch.joinX + totalBranchesWidth;

                firstJoinTargets.push({
                    x: branchJoinX,
                    y: choicesContainerTopOffset,
                });

                if (processedBranch.hasTerminator) continue;

                lastJoinTargets.push({
                    x: branchJoinX,
                    y: processedBranch.joinY + choiceLabelHeight + placeholderHeight / 2,
                });
            }

            if (customJoinOrigins && customJoinOrigins.length) {
                for (let i = 0; i < customJoinOrigins.length; i++) {
                    JoinView.createTwoAnglesVerticalJoins(element, customJoinOrigins[i], [firstJoinTargets[i]]);
                }
            }
            else {
                JoinView.createTwoAnglesVerticalJoins(element, { x: joinX, y: choicesContainerTopOffset - placeholderHeight }, firstJoinTargets, placeholderHeight / 2);
            }

            JoinView.createOneAngleVerticalJoins(element, { x: joinX, y: totalBranchesHeight }, lastJoinTargets);
        }
        else {
            for (const processedBranch of processedBranches) {
                const branchJoinY = processedBranch.offsetY + processedBranch.joinY + totalBranchesHeight;

                firstJoinTargets.push({
                    x: choiceLabelWidth + placeholderWidth,
                    y: branchJoinY,
                });

                if (processedBranch.hasTerminator) continue;

                lastJoinTargets.push({
                    x: processedBranch.joinX + choiceLabelWidth - padding,
                    y: branchJoinY,
                });
            }


            if (customJoinOrigins && customJoinOrigins.length) {
                for (let i = 0; i < customJoinOrigins.length; i++) {
                    JoinView.createTwoAnglesHorizontalJoins(element, customJoinOrigins[i], [firstJoinTargets[i]]);
                }
            }
            else {
                JoinView.createTwoAnglesHorizontalJoins(element, { x: choiceLabelWidth, y: joinY }, firstJoinTargets, placeholderWidth / 2);
            }

            JoinView.createOneAngleHorizontalJoins(element, { x: maxWidth, y: joinY }, lastJoinTargets);
        }

        let choicesContainerBgWidth = choiceLabelWidth;
        if (maxWidth > choicesContainerBgWidth) {
            choicesContainerBgWidth = maxWidth;
        }

        // Output connection dot
        const endConnection = DomHelper.svg('circle', {
            r: 5,
            cx: flowMode === 'vertical' ? joinX : maxWidth,
            cy: flowMode === 'vertical' ? totalBranchesHeight : joinY,
            class: 'output choicesContainerConnection',
            fill: "black",
            stroke: "black",
        });

        element.appendChild(endConnection);
        element.appendChild(choicesContainer);
        containerElement.appendChild(element);
        containerElement.appendChild(selectableElement);

        await addHasErrorIfNecessary(element, node, parentNode, context);

        const nodeTreeView = new NodeTreeView(containerElement, parentElement, maxWidth, totalBranchesHeight, joinX, joinY, sequences);

        if (selectableElement) {
            nodeTreeView.selectableElement = selectableElement;
        }

        return nodeTreeView;
    }
}

export interface Branch {
    sequence: Sequence;
    content: SVGElement;
    width: number;
    height: number;
    joinX: number;
    joinY: number;
    origin?: Vector;
    originRelativeToContainer?: boolean;
    hasTerminator?: boolean;
}

interface ProcessedBranch extends Branch {
    offsetX: number;
    offsetY: number;
}