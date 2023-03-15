import { Node } from "../models";

export function getNodeClasses(node: Node): string[] {
    return [
        `node-${node.id}`,
        `node--type-${node.type}`,
    ];
}