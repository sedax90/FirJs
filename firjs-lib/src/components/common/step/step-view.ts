import { LabelContainer, LabelContainerProps } from "../label/label-container";
import { LabelView, LabelViewProps } from "../label/label-view";
import dragIcon from '../../../assets/drag_indicator.svg';
import { Context, Node } from "../../../models";
import { DomHelper } from "../../../utils/dom-helper";

export class StepView {
    private static defaultWidth: number = 200;
    private static defaultHeight: number = 46;

    private constructor(
        public element: SVGElement,
        public width: number,
        public height: number,
    ) { }

    public static async create(node: Node, context: Context, props?: StepViewProps): Promise<StepView> {
        const step = DomHelper.svg('g', {
            class: 'step',
        });
        const container = LabelContainer.create({
            ...props?.container,
            width: StepView.defaultWidth,
            height: StepView.defaultHeight,
        });
        step.appendChild(container);

        let customIcon = node?.icon;
        if (context.userDefinedOverriders?.overrideIcon) {
            customIcon = await context.userDefinedOverriders.overrideIcon(node);
        }

        const iconContainer = StepView._createIcons(customIcon);
        step.appendChild(iconContainer);

        let text: string = "";
        if (context?.userDefinedOverriders?.overrideLabel) {
            text = await context.userDefinedOverriders.overrideLabel(node);
        }
        else {
            text = node?.label ? node.label : node.id;
        }

        const label = LabelView.create(text, context, {
            ...props?.label,
        });
        step.appendChild(label.element);


        let containerWidth = StepView.defaultWidth;

        const iconMarginRight = 10;
        const totalIconSizes = iconMarginRight + ((customIcon) ? (22 + StepView.defaultHeight) : 22);

        const labelWidth = label.textLength;
        if (labelWidth + totalIconSizes > containerWidth) {
            containerWidth = labelWidth + totalIconSizes * 2;
        }
        else {
            containerWidth = containerWidth + totalIconSizes / 2;
        }

        const labelOffsetX = containerWidth / 2;
        const labelOffsetY = StepView.defaultHeight / 2;
        DomHelper.translate(label.element, labelOffsetX, labelOffsetY);

        container.setAttribute('width', containerWidth.toString());

        return new StepView(step, containerWidth, StepView.defaultHeight);
    }

    private static _createIcons(customIcon: string | undefined): SVGElement {
        const iconContainer = DomHelper.svg('g', {
            class: 'label-icon-container',
        });

        const dragIconSize = 22;

        iconContainer.appendChild(DomHelper.svg('image', {
            href: dragIcon,
            width: dragIconSize,
            height: dragIconSize,
            x: 0,
            y: StepView.defaultHeight / 2 - dragIconSize / 2,
            opacity: 0.25,
            cursor: 'move',
        }));

        const iconContainerHeight = StepView.defaultHeight;
        if (customIcon) {
            const customIconContainer = DomHelper.svg('g', {
                class: "custom-label-container",
            });

            const iconBg = DomHelper.svg('rect', {
                class: "label-icon-bg",
                width: iconContainerHeight,
                height: iconContainerHeight,
            });

            const iconSize = iconContainerHeight;
            const iconImage = DomHelper.svg('image', {
                class: "label-icon",
                href: customIcon,
                width: iconSize,
                height: iconSize,
                x: 0,
                y: 0,
            });

            customIconContainer.appendChild(iconBg);
            customIconContainer.appendChild(iconImage);

            DomHelper.translate(customIconContainer, dragIconSize, 0);

            iconContainer.appendChild(customIconContainer);
        }

        return iconContainer
    }
}

export interface StepViewProps {
    container?: LabelContainerProps,
    label?: LabelViewProps,
}