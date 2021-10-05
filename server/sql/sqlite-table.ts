import * as db from 'better-sqlite3';
import { IDbColumn, DbTypes } from './sqlite';

interface IDbTypeMap {
    [key: string]: DbTypes
}

interface ITransforms<T> {
    columnName:string;
    read: (item: T) => any;
    write: (item: T) => any;
}

export class Table<T extends { [key: string]: any }> {

    name: string;
    database: db.Database;
    columns: IDbColumn[];
    transforms: ITransforms<T>[];
    mappings: IDbTypeMap = {
        [DbTypes.Blob]: DbTypes.Blob,
        [DbTypes.Boolean]: DbTypes.Integer,
        [DbTypes.Integer]: DbTypes.Integer,
        [DbTypes.Json]: DbTypes.Text,
        [DbTypes.Real]: DbTypes.Real,
        [DbTypes.Text]: DbTypes.Text
    }

    constructor(database: db.Database, name: string, columns: IDbColumn[]) {
        this.database = database;
        this.name = name;
        this.columns = columns;
        this.transforms = [];

        for (let column of columns) {
            if (column.type === DbTypes.Boolean) {
                this.transforms.push({
                    columnName: column.name,
                    read: (item) => (item as any)[column.name] = item[column.name] === 1,
                    write: (item) => (item as any)[column.name] = item[column.name] === true ? 1 : 0
                });
            }

            if (column.type === DbTypes.Json) {
                this.transforms.push({
                    columnName: column.name,
                    read: (item) => (item as any)[column.name] = JSON.parse(item[column.name]),
                    write: (item) => (item as any)[column.name] = JSON.stringify(item[column.name])
                });
            }
        }

    }

    private postReadTransform(data: T) {

        if (!data) {
            return null;
        }

        for (let transform of this.transforms) {
            transform.read(data)
        }

        return data;
    }

    private preWriteTransform(data: T) {
        for (let transform of this.transforms) {
            transform.write(data)
        }

        return data;
    }


    private getKeyName(): string {
        return this.columns.find(w => w.isPrimaryKey == true)?.name ?? "";
    }

    exists() {
        const response = this.database.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=(?)`).get(this.name);
        return response != null;
    }

    create() {

        const sql = this.columns.map(w => {
            const pk = w.isPrimaryKey ? " PRIMARY KEY" : ""
            const type = this.mappings[w.type];
            return `[${w.name}] ${type}${pk}`;
        }).join(",");

        this.database.prepare(`CREATE TABLE ${this.name} (${sql})`).run();

        return this.exists();
    }

    find(value: string | number) {

        const keyName = this.getKeyName();
        const response = this.database.prepare(`SELECT * FROM ${this.name} WHERE [${keyName}] = (?)`).get(value);

        return this.postReadTransform(response);
    }

    findBy(value: string | number, columnName: string) {

        const response = this.database.prepare(`SELECT * FROM ${this.name} WHERE [${columnName}] = (?)`).get(value);

        return this.postReadTransform(response);
    }

    maxBy(columnName: string): { Max: number | null } {
        return this.database.prepare(`Select MAX([${columnName}]) as Max FROM ${this.name}`).get();
    }

    all(): T[] {

        const keyName = this.getKeyName();
        const stmt = this.database.prepare(`SELECT * FROM ${this.name} WHERE [${keyName}] IS NOT NULL`);
        let resp = [];
        for (let row of stmt.iterate()) {
            try {
                const item = this.postReadTransform(row);

                if (item == null) {
                    continue;
                }

                resp.push(item);
            } catch (e) { }
        }

        return resp;
    }

    allBy(value: string | number, columnName: string): T[] {
        const statement = this.database.prepare(`SELECT * FROM ${this.name} WHERE [${columnName}] = (?)`).bind(value) as any;

        let resp: T[] = [];
        for (let row of statement.iterate()) {
            try {

                const item = this.postReadTransform(row);

                if (item == null) {
                    continue;
                }

                resp.push(item);
            } catch (e) { }
        }

        return resp;
    }

    updateMany(data: T[]) {
        return data.map(w => this.update(w));
    }

    updateBy(data: T, value: string | number, columnName: string) {
        let columns = [];
        let values = [];
        const properties = Object.keys(data);

        for (let transform of this.transforms) {
            
            if (properties.includes(transform.columnName) == false) {
                continue;
            }

            transform.write(data);
        }

        for (let property of properties) {

            const column = this.columns.find(w => w.name == property);

            if (!column) {
                throw `Property not found in schema. Property: ${property}`;
            }

            if (column.isPrimaryKey) {
                continue;
            }

            columns.push(column.name);

            const value = data[column.name];

            if (value == null) {
                values.push("NULL");
            } else {
                values.push(value);
            }
        }

        return this.database.prepare(`Update ${this.name} Set ${columns.map(w => `[${w}] = ?`).join(",")} Where [${columnName}] = (?)`).run(...values, value);
    }

    update(data: T) {
        let columns = [];
        let values = [];
        const properties = Object.keys(data);

        for (let transform of this.transforms) {
            
            if (properties.includes(transform.columnName) == false) {
                continue;
            }

            transform.write(data);
        }

        for (let property of properties) {

            const column = this.columns.find(w => w.name == property);

            if (!column) {
                throw `Property not found in schema. Property: ${property}`;
            }

            if (column.isPrimaryKey) {
                continue;
            }

            columns.push(column.name);

            const value = data[column.name];

            if (value == null) {
                values.push("NULL");
            } else {
                values.push(value);
            }
        }

        const keyName = this.getKeyName();
        const keyValue = data[keyName];

        return this.database.prepare(`Update ${this.name} Set ${columns.map(w => `[${w}] = ?`).join(",")} Where [${keyName}] = (?)`).run(...values, keyValue);
    }

    insert(data: T) {

        let columns = [];
        let values = [];

        const transformedData = this.preWriteTransform(data);

        for (let column of this.columns) {
            columns.push(`[${column.name}]`);

            const value = transformedData[column.name];

            if (value == null) {
                // make sure we insert null for undefined
                values.push(null);
            } else {
                values.push(value);
            }
        }

        const keyName = this.getKeyName();
        const keyValue = transformedData[keyName];

        this.database.prepare(`INSERT INTO ${this.name} (${columns.join(",")}) VALUES (${columns.map(() => "?").join(",")})`).run(...values);

        return this.find(keyValue);
    }

    delete(keyValue: string | number) {
        const keyName = this.getKeyName();
        return this.database.prepare(`DELETE FROM ${this.name} WHERE [${keyName}] = (?)`).run(keyValue);
    }

    deleteBy(value: string | number, columnName: string) {
        return this.database.prepare(`DELETE FROM ${this.name} WHERE [${columnName}] = (?)`).run(value);
    }
}