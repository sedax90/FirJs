import { Placeholder } from "../components/placeholder/placeholder";
import { Context, Vector } from "../models";
import { getComponentPositionInWorkspace } from "./component-position-utils";

export class PlaceholderFinder {
    private constructor(
        private placeholders: Placeholder[],
        private context: Context,
    ) { }

    private static _instance: PlaceholderFinder;
    private _cache: {
        placeholder: Placeholder;
        letTopPosition: Vector;
        bottomRightPosition: Vector;
    }[] = [];

    static getInstance(context: Context): PlaceholderFinder {
        if (!PlaceholderFinder._instance) {
            PlaceholderFinder._instance = new PlaceholderFinder([], context);
        }

        return PlaceholderFinder._instance;
    }

    buildCache(placeholders: Placeholder[]): void {
        this.placeholders = placeholders;
        this._cache = [];

        this.recalculatePositions();
    }

    recalculatePositions(): void {
        for (const placeholder of this.placeholders) {
            const position = getComponentPositionInWorkspace(placeholder);

            const currentScale = this.context.designerState.scale;
            const placeholderElementWidthScaled = placeholder.view.width * currentScale;
            const placeholderElementHeightScaled = placeholder.view.height * currentScale;

            const leftTopPosition = {
                x: position.x,
                y: position.y,
            };
            const rightBottomPosition = {
                x: position.x + placeholderElementWidthScaled,
                y: position.y + placeholderElementHeightScaled,
            };

            this._cache.push({
                placeholder,
                letTopPosition: leftTopPosition,
                bottomRightPosition: rightBottomPosition,
            });
        }

        this._cache.sort((a, b) => a.letTopPosition.y - b.letTopPosition.y);
    }

    findByPosition(mousePosition: Vector, componentWidth: number, componentHeight: number): Placeholder | null {
        const vR = mousePosition.x + componentWidth;
        const vB = mousePosition.y + componentHeight;

        for (const cacheItem of this._cache) {
            if (Math.max(mousePosition.x, cacheItem.letTopPosition.x) < Math.min(vR, cacheItem.bottomRightPosition.x) && Math.max(mousePosition.y, cacheItem.letTopPosition.y) < Math.min(vB, cacheItem.bottomRightPosition.y)) {
                return cacheItem.placeholder;
            }
        }

        return null;
    }
}
