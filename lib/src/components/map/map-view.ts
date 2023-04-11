import { JoinView } from "../common/join/join-view";
import { DomHelper } from "../../utils/dom-helper";
import { Context, MapProps, Node } from "../../models";
import { ParentView } from "../parent/parent-view";
import { PlaceholderView } from "../placeholder/placeholder-view";
import { Sequence } from "../sequence/sequence";
import loopIcon from '../../assets/sync.svg';
import { StepView } from "../common/step/step-view";
import { getNodeClasses } from "../../utils/node-utils";
import { addHasErrorIfNecessary } from "../../utils/error-helper";

export class MapView extends ParentView {
    private _selectableElement!: SVGElement;

    public static async create(parent: SVGElement, node: Node, parentNode: Node | null, context: Context): Promise<MapView> {
        const props = node.props as MapProps;
        const nodes = props?.children ? props.children : [];

        const element = DomHelper.svg('g', {
            class: "map",
        });
        element.classList.add(...getNodeClasses(node));

        const stepView = await StepView.create(node, context);

        const mapLabelWidth = stepView.width;
        const mapLabelHeight = stepView.height;
        const sequenceGroup = DomHelper.svg('g', {
            class: "map-children-wrapper",
        });

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

        stepView.element.appendChild(mapLabelIcon);

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
        element.appendChild(stepView.element);
        parent.appendChild(element);

        const direction = context.designerState.direction;

        // Create sequence
        let sequenceViewTopOffset = (direction === 'vertical') ? (mapLabelHeight + PlaceholderView.height) : 0;

        const sequenceComponent = await Sequence.create(nodes, node, childrenContainer, context);
        let totalHeight;

        if (direction === 'vertical') {
            totalHeight = mapLabelHeight + sequenceComponent.view.height + sequenceViewTopOffset;
        }
        else {
            totalHeight = sequenceComponent.view.height;
        }

        const childrenContainerBgLeftOffset = 30;
        const childrenContainerBgTopOffset = 10;

        let childrenContainerBgWidth = mapLabelWidth;
        let childrenContainerBgHeight = totalHeight;

        if (sequenceComponent.view.width > childrenContainerBgWidth) {
            childrenContainerBgWidth = sequenceComponent.view.width;
        }

        if (sequenceComponent.view.height > childrenContainerBgHeight) {
            childrenContainerBgHeight = sequenceComponent.view.height;
        }

        if (direction === 'vertical') {
            childrenContainerBgWidth = childrenContainerBgWidth + childrenContainerBgLeftOffset;
            childrenContainerBgHeight = childrenContainerBgHeight - childrenContainerBgTopOffset;
        }
        else {
            childrenContainerBgWidth = childrenContainerBgWidth + PlaceholderView.width + stepView.width;
            childrenContainerBgHeight = childrenContainerBgHeight + childrenContainerBgLeftOffset;
        }

        childrenContainerBg.setAttribute('width', `${childrenContainerBgWidth}px`);
        childrenContainerBg.setAttribute('height', `${childrenContainerBgHeight}px`);

        const joinX = childrenContainerBgWidth / 2;
        const joinY = totalHeight / 2;

        // Create join line between label and sequence
        let sequenceOffsetLeft = childrenContainerBgLeftOffset;
        if (nodes.length) {
            if (direction === 'vertical') {
                JoinView.createConnectionJoin(childrenContainer, { x: childrenContainerBgWidth / 2, y: mapLabelHeight }, PlaceholderView.height, context);
            }
            else {
                JoinView.createConnectionJoin(childrenContainer, { x: mapLabelWidth, y: joinY }, PlaceholderView.width, context);
            }
        }
        else {
            sequenceOffsetLeft = childrenContainerBgWidth;
        }

        // Output connection dot
        const endConnection = DomHelper.svg('circle', {
            r: 5,
            cx: direction === 'vertical' ? joinX : childrenContainerBgWidth,
            cy: direction === 'vertical' ? totalHeight : joinY,
            class: 'output',
            fill: "black",
            stroke: "black",
        });
        childrenContainer.appendChild(endConnection);

        if (direction === 'vertical') {
            DomHelper.translate(childrenContainerBg, 0, childrenContainerBgTopOffset);
            DomHelper.translate(stepView.element, (childrenContainerBgWidth - mapLabelWidth) / 2, 0);
            DomHelper.translate(sequenceComponent.view.element, (sequenceOffsetLeft / 2), sequenceViewTopOffset);
        }
        else {
            DomHelper.translate(childrenContainerBg, childrenContainerBgTopOffset, -childrenContainerBgLeftOffset / 2);
            DomHelper.translate(stepView.element, 0, 0);
            DomHelper.translate(sequenceComponent.view.element, mapLabelWidth + PlaceholderView.width, joinY - sequenceComponent.view.joinY);
        }

        await addHasErrorIfNecessary(element, node, parentNode, context);

        const mapView = new MapView(element, parent, childrenContainerBgWidth, totalHeight, joinX, joinY, sequenceComponent);
        mapView._selectableElement = stepView.element;
        return mapView;
    }

    setDragging(value: boolean): void {
        if (value) {
            this.element.classList.add('dragging');
        }
        else {
            this.element.classList.remove('dragging');
        }
    }

    setSelected(status: boolean): void {
        if (status) {
            this.element.classList.add('selected');
        }
        else {
            this.element.classList.remove('selected');
        }
    }


    getSelectableElement(): HTMLElement | SVGElement | null {
        return this._selectableElement;
    }
}