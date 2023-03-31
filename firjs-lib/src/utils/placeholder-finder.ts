import { Placeholder } from "../components/placeholder/placeholder";
import { Vector } from "../models";
import { getComponentPositionInWorkspace } from "./component-position-utils";

export class PlaceholderFinder {
    private constructor(
        private readonly placeholders: Placeholder[]
    ) { }

    public static create(placeholders: Placeholder[]): PlaceholderFinder {
        return new PlaceholderFinder(placeholders);
    }

    private _cache?: {
        placeholder: Placeholder;
        letTopPosition: Vector;
        bottomRightPosition: Vector;
    }[];

    public findByPosition(mousePosition: Vector, componentWidth: number, componentHeight: number): Placeholder | undefined {
        this._cache = [];

        for (const placeholder of this.placeholders) {
            const position = getComponentPositionInWorkspace(placeholder);
            this._cache?.push({
                placeholder,
                letTopPosition: { x: position.x, y: position.y },
                bottomRightPosition: { x: position.x + placeholder.view.width, y: position.y + placeholder.view.height }
            });
        }
        this._cache.sort((a, b) => a.letTopPosition.y - b.letTopPosition.y);

        const vR = mousePosition.x + componentWidth;
        const vB = mousePosition.y + componentHeight;

        for (const cacheItem of this._cache) {
            if (Math.max(mousePosition.x, cacheItem.letTopPosition.x) < Math.min(vR, cacheItem.bottomRightPosition.x) && Math.max(mousePosition.y, cacheItem.letTopPosition.y) < Math.min(vB, cacheItem.bottomRightPosition.y)) {
                return cacheItem.placeholder;
            }
        }
    }
}
