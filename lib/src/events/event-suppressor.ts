export class EventSuppressor {
    private _events!: Set<string>;
    private static _instance: EventSuppressor;

    private constructor() {
        this._events = new Set();
    }

    static getInstance(): EventSuppressor {
        if (!EventSuppressor._instance) {
            this._instance = new EventSuppressor();
        }

        return this._instance;
    }

    suppress(event: keyof HTMLElementEventMap): void {
        this._events.add(event);
    }

    contains(event: keyof HTMLElementEventMap): boolean {
        return this._events.has(event);
    }

    release(event: keyof HTMLElementEventMap): void {
        this._events.delete(event);
    }
}