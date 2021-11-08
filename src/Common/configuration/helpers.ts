/// <reference path="../../common-types.d.ts"/>
import { Indexable } from "./indexable";

export const mergeAndTranslateSettings = <T>(appSettings: T, environmentSettings: DeepPartial<T>): any => {

    let indexableAppSettings: Indexable = <any>appSettings;
    let indexableEnvironmentSettings: Indexable = <any>environmentSettings;

    // merge the environment settings into the global settings
    for (let prop in indexableEnvironmentSettings) {
        indexableAppSettings[prop] = indexableEnvironmentSettings[prop];
    }

    let result: any = {};

    // stringify the settings
    for (let prop in indexableAppSettings) {
        result[prop] = JSON.stringify(indexableAppSettings[prop]);
    }

    return result;
}