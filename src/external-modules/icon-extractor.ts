/// <reference path="../common-types.d.ts"/>

export const getIcon = async (path: string): Promise<string> => {
    return await window.api.interactivity().getIcon(path)
}