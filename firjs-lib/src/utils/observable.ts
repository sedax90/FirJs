export class Observable<T> {
    private _observers: Array<(data: T) => void> = [];
    private _data: T | undefined;

    constructor(data?: T) {
        this._data = data;
    }

    next(data: T): void {
        this._data = data;

        for (const observer of this._observers) {
            observer(this._data);
        }
    }

    subscribe(observerFunction: (data: T) => void): void {
        this._observers.push(observerFunction);
    }

    getValue(): T | undefined {
        return this._data;
    }
}