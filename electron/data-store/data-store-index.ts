import * as path from 'path';
import { FileReaderWriter } from './file-reader-writer';

export class DataStoreIndex implements IDataStore {

    private directory: string;
    private indexName: string;
    private options: IDataStoreIndexOptions;

    constructor(indexName: string, directory: string, options?:IDataStoreIndexOptions) {
        this.directory = directory;
        this.indexName = indexName;

        if (!options) {
            this.options = {
                parseResponse: true
            };
        } else {
            this.options = options;
        }
    }
    createAt<T extends ItemBase>(item: T, key: keyof T): Promise<T | null> {
        throw new Error('Method not implemented.');
    }

    private getIndexFileNameAndPath() {
        return path.join(this.directory, `${this.indexName}.data`);
    }

    private getTempIndexFileNameAndPath() {
        return path.join(this.directory, `${this.indexName}_temp.data`);
    }

    private getLock() {
        return path.join(this.directory, this.indexName);
    }

    async update<T extends ItemBase>(item: T, key: keyof T) {
        const index = this.getIndexFileNameAndPath();
        const temp = this.getTempIndexFileNameAndPath();
        const lock = this.getLock();
        const readerWriter = new FileReaderWriter({
            index,
            temp,
            lock,
            directory: this.directory,
            parseResponse: this.options.parseResponse
        });

        return await readerWriter.update(item, key);
    }

    async create<T extends ItemBase>(item: T, key: keyof T) {
        const index = this.getIndexFileNameAndPath();
        const temp = this.getTempIndexFileNameAndPath();
        const lock = this.getLock();
        const readerWriter = new FileReaderWriter({
            index,
            temp,
            lock,
            directory: this.directory,
            parseResponse: this.options.parseResponse
        });

        return await readerWriter.create(item, key);
    }

    async all<T extends ItemBase>(): Promise<T[]> {
        const index = this.getIndexFileNameAndPath();
        const temp = this.getTempIndexFileNameAndPath();
        const lock = this.getLock();
        const readerWriter = new FileReaderWriter({
            index,
            temp,
            lock,
            directory: this.directory,
            parseResponse: this.options.parseResponse
        });

        return await readerWriter.all();
    }

    async find<T extends ItemBase>(id: number): Promise<T | null> {
        const index = this.getIndexFileNameAndPath();
        const temp = this.getTempIndexFileNameAndPath();
        const lock = this.getLock();
        const readerWriter = new FileReaderWriter({
            index,
            temp,
            lock,
            directory: this.directory,
            parseResponse: this.options.parseResponse
        });

        return await readerWriter.find(id);
    }

    async delete(id: number) {
        const index = this.getIndexFileNameAndPath();
        const temp = this.getTempIndexFileNameAndPath();
        const lock = this.getLock();
        const readerWriter = new FileReaderWriter({
            index,
            temp,
            lock,
            directory: this.directory,
            parseResponse: this.options.parseResponse
        });

        return await readerWriter.delete(id);
    }
}