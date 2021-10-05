import { cloneDeep as cd, max } from 'lodash';

export const cloneDeep = <T extends any>(data: T) => {
    return cd(data);
}

export const cloneShallow = <T extends any>(data: T) => {
    return JSON.parse(JSON.stringify(data)) as T;
}

export const getPathWithoutFileName = (path: string) => {
    return path.substring(0, path.lastIndexOf("\\"));
}

export const getNextId = <T>(data: T[], selector: (item:T) => number | string) => {
    const ids = data.map(w => parseInt(selector(w) as any))
    return (max(ids) ?? 0) + 1;
}

export const getFileNameWithoutExtension = (name:string) => {
    return name.split('.').slice(0, -1).join('.')
}