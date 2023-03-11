import { DomHelper } from "../utils/dom-helper";
import { ComponentInstance, Context, ElementView } from "../models";

export class DragView implements ElementView {
    private constructor(
        readonly element: SVGElement,
        readonly parent: HTMLElement,
        readonly context: Context,
    ) { }

    static create(componentInstance: ComponentInstance, context: Context): DragView {
        const componentView = componentInstance.view;

        if (componentView.setDragging) {
            componentView.setDragging(true);
        }

        let clone!: SVGElement;
        let width!: number;
        let height!: number;

        clone = componentView.element.cloneNode(true) as SVGElement;
        width = componentView.width;
        height = componentView.height;

        clone.removeAttribute('transform');
        const zoomLevel = context.designerState.zoomLevel;
        clone.setAttribute('transform', `scale(${zoomLevel})`);

        const dragSvg = DomHelper.svg('svg', {
            width: width + width * zoomLevel,
            height: height + height * zoomLevel,
        });
        dragSvg.style.position = 'absolute';
        dragSvg.style.zIndex = '2';
        dragSvg.appendChild(clone);

        const parent = document.getElementById('workspace-root');
        if (parent) {
            parent.appendChild(dragSvg);
        }

        return new DragView(dragSvg, document.body, context);
    }

    destroy(): void {
        this.element.remove();
    }
}