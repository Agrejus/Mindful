type IDictionary<T> = { [key: number]: { index: number, value: T } }

export class DataSource<T> {

    private key: keyof T;
    private items: T[] = [];
    private dictionary: IDictionary<T> = {};

    constructor(key: keyof T, items: T[] = []) {
        this.items = items;
        this.key = key;
        this.dictionary = this.createDictionary(items);
    }

    get length() {
        return this.items.length;
    }

    clone() {
        return new DataSource<T>(this.key, [...this.items]);
    }

    map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any) {
        return this.items.map(callbackfn, thisArg);
    }

    toList() {
        return this.items;
    }

    add(item:T) {

        const index = this.items.push(item) - 1;
        this.dictionary[item[this.key] as any] = {
            index, 
            value: item
        }
    }

    getAt(index:number) {
        return this.items[index];
    }

    get(id: number) {
        return this.dictionary[id].value;
    }

    remove(id: number) {
        debugger;
        const dictionaryItem = this.dictionary[id];

        if (!dictionaryItem) {
            return false;
        }

        this.items.splice(dictionaryItem.index, 1);
        delete this.items[dictionaryItem.index];

        return true;
    }

    setPropertyValue(value: T, property: keyof T) {
        const key = value[this.key] as any;
        const dictionaryItem = this.dictionary[key];

        if (!dictionaryItem) {
            return false;
        }

        this.items[dictionaryItem.index][property] = value[property];
        dictionaryItem.value[property] = value[property];

        return true;
    }

    set(value: T) {
        const key = value[this.key] as any;
        const dictionaryItem = this.dictionary[key];

        if (!dictionaryItem) {
            return false;
        }

        this.items[dictionaryItem.index] = value;
        dictionaryItem.value = value;

        return true;
    }

    find(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): T | undefined {
        return this.items.find(predicate, thisArg);
    }

    filter(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): T[] {
        return this.items.filter(predicate, thisArg);
    }

    findIndex(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): number {
        return this.items.findIndex(predicate, thisArg);
    }

    private createDictionary = (items: T[]): IDictionary<T> => {
        return Object.assign({}, ...items.filter(w => !!w[this.key]).map((x, i) => ({
            [x[this.key] as any]: {
                index: i,
                value: x
            }
        })));
    }
}