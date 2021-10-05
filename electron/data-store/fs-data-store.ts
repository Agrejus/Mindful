/// <reference path="./fs-data-store.d.ts"/>

import { DataStoreIndex } from './data-store-index';

export class DataStore {

    private directory: string;

    constructor(directory?: string) {

        if (!directory) {
            this.directory = process.cwd();
        } else {
            this.directory = directory;
        }
    }

    connectTo(indexName: string, options?:IDataStoreIndexOptions): IDataStore {
        return new DataStoreIndex(indexName, this.directory, options);
    }
}