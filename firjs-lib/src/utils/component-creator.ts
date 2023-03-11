import { Choice } from "../components/choice/choice";
import { Map } from "../components/map/map";
import { Task } from "../components/task/task";
import { ComponentInstance, Context, Node } from "../models";

export class ComponentCreator {
    static createComponent(node: Node, parentNode: Node | null, parentElement: SVGElement, context: Context): ComponentInstance | null {
        switch (node.type) {
            case 'task':
                return Task.create(parentElement, node, parentNode, context);

            case 'map':
                return Map.create(parentElement, node, parentNode, context);

            case 'choice':
                return Choice.create(parentElement, node, parentNode, context);
        }

        return null;
    }
}