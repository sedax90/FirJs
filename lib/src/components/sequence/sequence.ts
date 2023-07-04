import { ComponentInstance, Context, Node } from "../../models";
import { ClickEvent } from "../../utils/event-utils";
import { SequenceView } from "./sequence-view";

export class Sequence implements ComponentInstance {
    constructor(
        readonly view: SequenceView,
        readonly context: Context,
        readonly nodes: Node[],
        readonly parentNode: Node | null,
    ) {
        for (const component of view.componentInstances) {
            component.parentSequence = this;
        }
    }

    parentSequence!: Sequence | null;
    indexInSequence!: number;

    public static async create(sequenceNodes: Node[], parentNode: Node | null, parentElement: SVGElement, context: Context): Promise<Sequence> {
        const view = await SequenceView.create(parentElement, sequenceNodes, parentNode, context);
        const sequence = new Sequence(view, context, sequenceNodes, parentNode);

        // Update view placeholders
        for (const placeholder of view.placeholders) {
            placeholder.parentSequence = sequence;
        }

        return sequence;
    }

    findByClick(click: ClickEvent): ComponentInstance | null {
        for (const componentInstance of this.view.componentInstances) {
            const element = componentInstance.findByClick(click);
            if (element) {
                return element;
            }
        }

        return null;
    }

    findById(nodeId: string): ComponentInstance | null {
        for (const componentInstance of this.view.componentInstances) {
            const element = componentInstance.findById(nodeId);
            if (element) {
                return element;
            }
        }

        return null;
    }

    isHover(target: Element): ComponentInstance | null {
        for (const componentInstance of this.view.componentInstances) {
            const element = componentInstance.isHover(target);
            if (element) {
                return element;
            }
        }

        return null;
    }

    getNodeIndex(node: Node): number {
        const id = node.id;
        return this.nodes.findIndex(e => e.id === id);
    }
}