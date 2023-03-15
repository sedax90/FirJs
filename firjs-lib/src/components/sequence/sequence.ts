import { ComponentInstance, Context, Node } from "../../models";
import { ClickEvent } from "../../utils/event-utils";
import { SequenceView } from "./sequence-view";

export class Sequence implements ComponentInstance {
    constructor(
        readonly view: SequenceView,
        readonly context: Context,
        readonly nodes: Node[],
    ) {
        for (const component of view.componentInstances) {
            component.parentSequence = this;
        }
    }

    parentSequence!: Sequence | null;

    public static async create(sequenceNodes: Node[], parentNode: Node | null, parentElement: SVGElement, context: Context): Promise<Sequence> {
        const view = await SequenceView.create(parentElement, sequenceNodes, parentNode, context);
        const sequence = new Sequence(view, context, sequenceNodes);

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
}