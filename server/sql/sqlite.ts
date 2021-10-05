import * as db from 'better-sqlite3';
import { Table } from './sqlite-table';

export enum DbTypes {
    Integer = "INTEGER",
    Real = "REAL",
    Text = "TEXT",
    Blob = "BLOB",
    Boolean = "BOOLEAN",
    Json = "JSON"
}

export interface IDbColumn {
    type: DbTypes;
    isPrimaryKey: boolean;
    name: string;
}

export class Database {

    database: db.Database;

    constructor(name: string = "json") {
        this.database = new db(`./${name}.sqlite`);
    }

    connectTo<T extends { [key: string]: any }>(name: string, columns: IDbColumn[]) {
        return new Table<T>(this.database, name, columns);
    }
}