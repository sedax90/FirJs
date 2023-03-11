import { LabelContainer, LabelContainerProps } from "../label/label-container";
import { LabelView, LabelViewProps } from "../label/label-view";
import dragIcon from '../../../assets/drag_indicator.svg';
import { Context, Node } from "../../../models";
import { DomHelper } from "../../../utils/dom-helper";

export class StepView {
    public static width: number = 200;
    public static height: number = 46;

    public static create(node: Node, context: Context, props?: StepViewProps): SVGElement {
        const step = DomHelper.svg('g', {
            class: 'step',
        });
        const container = LabelContainer.create({
            ...props?.container,
            width: StepView.width,
            height: StepView.height,
        });
        step.appendChild(container);

        const dragIconSize = 22;
        step.appendChild(DomHelper.svg('image', {
            href: dragIcon,
            width: dragIconSize,
            height: dragIconSize,
            x: 0,
            y: StepView.height / 2 - dragIconSize / 2,
            opacity: 0.25,
            cursor: 'move',
        }));

        let labelIcon = node?.icon;
        if (context.userDefinedOverriders?.overrideIcon) {
            labelIcon = context.userDefinedOverriders.overrideIcon(node);
        }

        const iconIconContainerSize = StepView.height;
        if (labelIcon) {
            const iconContainer = DomHelper.svg('g', {
                class: 'label-icon-container',
            });

            iconContainer.appendChild(DomHelper.svg('rect', {
                class: "label-icon-bg",
                width: iconIconContainerSize,
                height: iconIconContainerSize,
            }));

            DomHelper.translate(iconContainer, dragIconSize, 0);

            const iconSize = iconIconContainerSize;
            iconContainer.appendChild(DomHelper.svg('image', {
                class: "label-icon",
                href: labelIcon,
                width: iconSize,
                height: iconSize,
                x: iconIconContainerSize / 2 - iconSize / 2,
                y: iconIconContainerSize / 2 - iconSize / 2,
            }));

            step.appendChild(iconContainer);
        }

        let text: string = "";
        if (context?.userDefinedOverriders?.overrideLabel) {
            text = context.userDefinedOverriders.overrideLabel(node);
        }
        else {
            text = node?.label ? node.label : node.id;
        }

        const labelMarginX = 10;
        const totalIconSizes = dragIconSize + (labelIcon ? iconIconContainerSize : 0);
        const textAvailableSize = StepView.width - totalIconSizes - labelMarginX;
        const label = LabelView.create(text, {
            ...props?.label,
            x: textAvailableSize / 2,
            y: StepView.height / 2,
            containerWidth: textAvailableSize,
            containerHeight: StepView.height,
            textAlign: labelIcon ? 'left' : 'center',
        });

        const labelOffsetX = labelIcon ? totalIconSizes + labelMarginX : (LabelView.defaultWidth - textAvailableSize) / 2;
        DomHelper.translate(label, labelOffsetX, 0);

        step.appendChild(label);

        return step;
    }
}

export interface StepViewProps {
    container?: LabelContainerProps,
    label?: LabelViewProps,
}