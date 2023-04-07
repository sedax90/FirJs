export class Observable<T> {
    private _observers: Array<(data: T) => void> = [];
    private _data: T | undefined;
    private _dataComparator!: (currentValue: T | undefined, newValue: T | undefined) => boolean;

    constructor(data?: T, dataComparator?: (currentValue: T | undefined, newValue: T | undefined) => boolean) {
        this._data = data;

        if (dataComparator) {
            this._dataComparator = dataComparator;
        }
    }

    next(data: T): void {
        const equals = this._compareValues(this._data, data);
        if (equals) return;

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

    private _compareValues(oldValue: T | undefined, newValue: T | undefined): boolean {
        if (this._dataComparator) {
            return this._dataComparator(oldValue, newValue);
        }
        else {
            return oldValue === newValue;
        }
    }
}