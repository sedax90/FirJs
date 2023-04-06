import { Choice } from "../components/choice/choice";
import { Map } from "../components/map/map";
import { Task } from "../components/task/task";
import { Terminator } from "../components/terminator/terminator";
import { ComponentInstance, Context, Node } from "../models";

export class ComponentCreator {
    async createComponent(node: Node, parentNode: Node | null, parentElement: SVGElement, context: Context): Promise<ComponentInstance | null> {
        switch (node.type) {
            case 'task':
                return await Task.create(parentElement, node, parentNode, context);

            case 'map':
                return await Map.create(parentElement, node, parentNode, context);

            case 'choice':
                return await Choice.create(parentElement, node, parentNode, context);

            case 'terminator':
                return await Terminator.create(parentElement, node, parentNode, context);
        }

        return null;
    }
}