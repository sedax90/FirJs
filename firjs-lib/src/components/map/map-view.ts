import { JoinView } from "../common/join/join-view";
import { DomHelper } from "../../utils/dom-helper";
import { Context, MapProps, Node } from "../../models";
import { ParentView } from "../parent/parent-view";
import { PlaceholderView } from "../placeholder/placeholder-view";
import { Sequence } from "../sequence/sequence";
import loopIcon from '../../assets/sync.svg';
import { StepView } from "../common/step/step-view";

export class MapView extends ParentView {
    private _mapLabel!: SVGElement;

    public static create(parent: SVGElement, node: Node, context: Context): MapView {
        const props = node.props as MapProps;
        const nodes = props?.children ? props.children : [];

        const element = DomHelper.svg('g', {
            class: "map sequence nodes",
        });

        const mapLabelWidth = StepView.width;
        const mapLabelHeight = StepView.height;
        const sequenceGroup = DomHelper.svg('g', {
            class: "map-children-wrapper",
        });

        const step = StepView.create(node, context);

        const mapLabelIcon = DomHelper.svg('g', {
            class: "map-label-icon",
        });
        mapLabelIcon.appendChild(DomHelper.svg('circle', {
            r: 12,
            cx: mapLabelWidth / 2,
            cy: mapLabelHeight + 2,
            class: 'circle-label-icon',
            'stroke-width': 1.25,
        }));

        const iconSize = 20;
        mapLabelIcon.appendChild(DomHelper.svg('image', {
            href: loopIcon,
            width: iconSize,
            height: iconSize,
            x: mapLabelWidth / 2 - iconSize / 2,
            y: mapLabelHeight + 2 - iconSize / 2,
        }));

        step.appendChild(mapLabelIcon);

        const childrenContainer = DomHelper.svg('g', {
            class: "children-container",
        });
        const childrenContainerBg = DomHelper.svg('rect', {
            class: "children-container-bg",
            rx: 6,
        });

        childrenContainer.appendChild(childrenContainerBg);
        sequenceGroup.appendChild(childrenContainer);
        element.appendChild(sequenceGroup);
        element.appendChild(step);
        parent.appendChild(element);

        // Create sequence
        const sequenceViewTopOffset = mapLabelHeight + PlaceholderView.height;
        const sequenceComponent = Sequence.create(nodes, node, childrenContainer, context);
        const totalHeight = mapLabelHeight + sequenceComponent.view.height + sequenceViewTopOffset;

        const childrenContainerBgLeftOffset = 30;
        const childrenContainerBgTopOffset = 10;

        let childrenContainerBgWidth = mapLabelWidth;
        if (sequenceComponent.view.width > childrenContainerBgWidth) {
            childrenContainerBgWidth = sequenceComponent.view.width;
        }

        childrenContainerBgWidth = childrenContainerBgWidth + childrenContainerBgLeftOffset;

        childrenContainerBg.setAttribute('width', `${childrenContainerBgWidth}px`);
        childrenContainerBg.setAttribute('height', `${totalHeight - childrenContainerBgTopOffset}px`);

        // Create join line between label and sequence
        let sequenceOffsetLeft = childrenContainerBgLeftOffset;
        if (nodes.length) {
            JoinView.createConnectionJoin(childrenContainer, { x: childrenContainerBgWidth / 2, y: mapLabelHeight }, PlaceholderView.height, context);
        }
        else {
            element.classList.add('has-error');
            sequenceOffsetLeft = childrenContainerBgWidth;
        }

        const joinX = childrenContainerBgWidth / 2;

        // Output connection dot
        const endConnection = DomHelper.svg('circle', {
            r: 6,
            cx: joinX,
            cy: totalHeight,
            class: 'output',
            fill: "black",
            stroke: "black",
        });
        childrenContainer.appendChild(endConnection);

        DomHelper.translate(step, (childrenContainerBgWidth - mapLabelWidth) / 2, 0);
        DomHelper.translate(childrenContainerBg, 0, childrenContainerBgTopOffset);
        DomHelper.translate(sequenceComponent.view.element, (sequenceOffsetLeft / 2), sequenceViewTopOffset);

        const mapView = new MapView(element, parent, childrenContainerBgWidth, totalHeight, joinX, sequenceComponent);
        mapView._mapLabel = step;
        return mapView;
    }

    setSelected(status: boolean): void {
        if (status) {
            this.element.classList.add('selected');
        }
        else {
            this.element.classList.remove('selected');
        }
    }
}