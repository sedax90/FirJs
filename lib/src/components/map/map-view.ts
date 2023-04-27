import { DomHelper } from "../../utils/dom-helper";
import { Context, MapProps, Node } from "../../models";
import { ParentView } from "../parent/parent-view";
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

        const placeholderWidth = context.options.style.placeholder.width;
        const placeholderHeight = context.options.style.placeholder.height;

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
            class: 'circle-label-icon',
            'stroke-width': 1.25,
        }));

        const iconSize = 20;
        mapLabelIcon.appendChild(DomHelper.svg('image', {
            href: loopIcon,
            width: iconSize,
            height: iconSize,
            x: -iconSize / 2,
            y: -iconSize / 2,
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

        const flowMode = context.designerState.flowMode;

        // Create sequence
        const sequenceComponent = await Sequence.create(nodes, node, childrenContainer, context);
        const childrenContainerBgLeftOffset = 30;
        const childrenContainerBgTopOffset = 10;

        let totalWidth = 0;
        let totalHeight = 0;
        let joinX;
        let joinY;

        let childrenContainerBgWidth;

        if (flowMode === 'vertical') {
            totalWidth = sequenceComponent.view.width + childrenContainerBgLeftOffset;
            totalHeight = sequenceComponent.view.height + mapLabelHeight - childrenContainerBgTopOffset;

            joinX = totalWidth / 2;
            joinY = totalHeight;

            childrenContainerBgWidth = totalWidth;
        }
        else {
            totalWidth = sequenceComponent.view.width + mapLabelWidth - childrenContainerBgTopOffset;
            totalHeight = sequenceComponent.view.height + childrenContainerBgLeftOffset;

            joinX = totalWidth;
            joinY = totalHeight / 2;

            childrenContainerBgWidth = totalWidth - childrenContainerBgTopOffset;
        }

        childrenContainerBg.setAttribute('width', `${childrenContainerBgWidth}px`);
        childrenContainerBg.setAttribute('height', `${totalHeight}px`);

        // Output connection dot
        const endConnection = DomHelper.svg('circle', {
            r: 5,
            cx: joinX,
            cy: flowMode === 'vertical' ? (joinY + childrenContainerBgTopOffset) : joinY,
            class: 'output',
            fill: "black",
            stroke: "black",
        });
        childrenContainer.appendChild(endConnection);

        if (flowMode === 'vertical') {
            DomHelper.translate(childrenContainerBg, 0, childrenContainerBgTopOffset);
            DomHelper.translate(stepView.element, (totalWidth - mapLabelWidth) / 2, 0);
            DomHelper.translate(sequenceComponent.view.element, childrenContainerBgLeftOffset / 2, placeholderHeight);
            DomHelper.translate(mapLabelIcon, stepView.width / 2, stepView.height);

            totalHeight = totalHeight + childrenContainerBgTopOffset;
        }
        else {
            DomHelper.translate(childrenContainerBg, childrenContainerBgTopOffset, 0);
            DomHelper.translate(stepView.element, 0, (totalHeight - stepView.height) / 2);
            DomHelper.translate(sequenceComponent.view.element, mapLabelWidth, joinY - sequenceComponent.view.joinY);
            DomHelper.translate(mapLabelIcon, stepView.width, stepView.height / 2);
        }

        await addHasErrorIfNecessary(element, node, parentNode, context);

        const mapView = new MapView(element, parent, totalWidth, totalHeight, joinX, joinY, sequenceComponent);
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

    setHover(isHover: boolean): void {
        if (isHover) {
            this.element.classList.add('hover');
        }
        else {
            this.element.classList.remove('hover');
        }
    }
}