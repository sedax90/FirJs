import { ComponentWithNode, Context, MapProps, Node } from "../../models";
import { ParentComponent } from "../parent/parent";
import { MapView } from "./map-view";

export class Map extends ParentComponent implements ComponentWithNode {

    public static create(parentElement: SVGElement, node: Node, parentNode: Node | null, context: Context): Map {
        if (!node.props) {
            node.props = {};
        }

        const props = node.props as MapProps;
        if (!props.children) {
            props.children = [];
        }

        const view = MapView.create(parentElement, node, context);
        const mapComponent = new Map(view, view.sequence, props.children, context);

        mapComponent.node = node;
        mapComponent.parentNode = parentNode;

        return mapComponent;
    }
}