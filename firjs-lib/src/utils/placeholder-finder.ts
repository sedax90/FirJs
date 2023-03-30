import { Placeholder } from "../components/placeholder/placeholder";
import { Vector } from "../models";
import { getComponentPositionInWorkspace } from "./component-position-utils";

export class PlaceholderFinder {
    private constructor(
        private readonly placeholders: Placeholder[],
        private readonly cache: PlaceholderCacheItem[]
    ) {
        // TODO rebuild cache based on events
    }

    static create(placeholders: Placeholder[]): PlaceholderFinder {
        const cache = PlaceholderFinder._rebuildCache(placeholders);
        return new PlaceholderFinder(placeholders, cache);
    }

    findByPosition(mousePosition: Vector, componentWidth: number, componentHeight: number): Placeholder | undefined {
        const vR = mousePosition.x + componentWidth;
        const vB = mousePosition.y + componentHeight;

        for (let i = 0; i < this.cache.length; i++) {
            const cacheItem = this.cache[i];

            if (Math.max(mousePosition.x, cacheItem.letTopPosition.x) < Math.min(vR, cacheItem.bottomRightPosition.x) && Math.max(mousePosition.y, cacheItem.letTopPosition.y) < Math.min(vB, cacheItem.bottomRightPosition.y)) {
                return this.placeholders[i];
            }
        }
    }

    private static _rebuildCache(placeholders: Placeholder[]): PlaceholderCacheItem[] {
        console.debug('rebuild cache');

        const cache: PlaceholderCacheItem[] = [];

        for (let i = 0; i < placeholders.length; i++) {
            const placeholder = placeholders[i];
            const position = getComponentPositionInWorkspace(placeholder);
            cache?.push({
                letTopPosition: { x: position.x, y: position.y },
                bottomRightPosition: { x: position.x + placeholder.view.width, y: position.y + placeholder.view.height }
            });
        }

        cache.sort((a, b) => a.letTopPosition.y - b.letTopPosition.y);
        return cache;
    }
}

interface PlaceholderCacheItem {
    letTopPosition: Vector;
    bottomRightPosition: Vector;
}