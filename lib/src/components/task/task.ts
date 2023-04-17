import { ComponentWithNode, Context, Node } from "../../models";
import { ChildlessComponent } from "../childless/childless";
import { TaskView } from "./task-view";

export class Task extends ChildlessComponent implements ComponentWithNode {

    static async create(parentElement: SVGElement, node: Node, parentNode: Node | null, context: Context): Promise<Task> {
        const view = await TaskView.create(parentElement, node, parentNode, context);
        const task = new Task(view, context);

        task.node = node;
        task.parentNode = parentNode;

        return task;
    }
}