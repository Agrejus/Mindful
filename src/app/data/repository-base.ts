import { max } from "lodash";
import { cloneDeep } from "../helpers/helpers";

export const create = async <T extends object, K extends keyof T>(item: T, storageKey: string, id: K, onAfterCreate?: (item: T) => void) => {
    const data = await get<T>(storageKey);
    let nextId = 1;

    if (data.length > 0) {
        const ids = data.map(w => w[id]);
        const maxId = max(ids);
        nextId = (maxId as any) + 1;
    }
    const savableItem = {
        ...item,
        [id]: nextId
    };

    const clonedSavableItem = cloneDeep(savableItem);

    if (onAfterCreate) {
        onAfterCreate(clonedSavableItem);
    }

    data.push(clonedSavableItem);
    save(data, storageKey);
    return savableItem;
}

export const get = async <T extends object>(storageKey: string, onAfterRetrieve?: (data: T[]) => void) => {
    const raw = localStorage.getItem(storageKey) || "[]";
    const result = JSON.parse(raw) as T[];

    if (onAfterRetrieve) {
        onAfterRetrieve(result);
    }

    return await result;
}

export const save = <T extends object>(data: T[], storageKey: string, onBeforeSave?: (data: T[]) => void) => {

    const clonedData = cloneDeep(data);

    if (onBeforeSave) {
        onBeforeSave(clonedData)
    }

    const saveRaw = JSON.stringify(clonedData);
    localStorage.setItem(storageKey, saveRaw);
}