import { max } from "lodash";

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

export abstract class BaseRepository {
    getNextId = (data: { [key: string]: any }) => {
        const keys = Object.keys(data).map(w => parseInt(w));
        let nextId = 1;

        if (keys.length !== 0) {
            const maxId = max(keys)!;
            nextId = maxId + 1;
        }

        return nextId;
    }

    asArray = (data: { [key: string]: any }) => {
        return Object.keys(data).map(w => data[w]);
    }
}