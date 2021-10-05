import { BaseRepository } from './base/base-repository';
import { IDbColumn, DbTypes } from './base/base-repository';

export class SectionsRepository extends BaseRepository {

    private indexName: string = "sections";
    private schema:IDbColumn[] = [
        { type: DbTypes.Integer, name: "sectionId", isPrimaryKey: true },
        { type: DbTypes.Text, name: "sectionName", isPrimaryKey: false },
        { type: DbTypes.Integer, name: "order", isPrimaryKey: false },
        { type: DbTypes.Text, name: "color", isPrimaryKey: false },
        { type: DbTypes.Boolean, name: "isDisabled", isPrimaryKey: false },
        { type: DbTypes.Boolean, name: "isSelected", isPrimaryKey: false },
        { type: DbTypes.Text, name: "createDateTime", isPrimaryKey: false },
        { type: DbTypes.Boolean, name: "isContextMenuVisible", isPrimaryKey: false },
        { type: DbTypes.Json, name: "widgets", isPrimaryKey: false },
        { type: DbTypes.Json, name: "settings", isPrimaryKey: false },
        { type: DbTypes.Boolean, name: "isArchived", isPrimaryKey: false }
    ];

    update = async (section: ISection) => {

        const response = await fetch(`${appSettings.apiEndpoint}/sql/table/items/update`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tableName: this.indexName,
                columns: this.schema,
                payload: section
            })
        });

        return await response.json() as ISection;
    }

    updateMany = async (sections: ISection[]) => {

        const response = await fetch(`${appSettings.apiEndpoint}/sql/table/items/updateMany`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tableName: this.indexName,
                columns: this.schema,
                payload: sections
            })
        });

        return await response.json();
    }

    insert = async (section: ISectionModifyRequest) => {
        const response = await fetch(`${appSettings.apiEndpoint}/sql/table/items/insert-identity`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tableName: this.indexName,
                columns: this.schema,
                payload: section
            })
        });

        return await response.json() as ISection;
    }

    delete = async (sectionId: number) => {
        const response = await fetch(`${appSettings.apiEndpoint}/sql/table/items/delete`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tableName: this.indexName,
                columns: this.schema,
                payload: sectionId
            })
        });

        return await response.json() as boolean;
    }

    get = async (sectionId: number) => {
        const response = await fetch(`${appSettings.apiEndpoint}/sql/table/items/find`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tableName: this.indexName,
                columns: this.schema,
                payload: sectionId
            })
        });

        return await response.json() as ISection;
    }

    tableExists = async () => {
        const response = await fetch(`${appSettings.apiEndpoint}/sql/table/exists`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tableName: this.indexName,
                columns: this.schema
            })
        });

        return await response.json() as boolean;
    }

    createTable = async () => {
        const response = await fetch(`${appSettings.apiEndpoint}/sql/table/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tableName: this.indexName,
                columns: this.schema
            })
        });

        return await response.json() as boolean;
    }

    getAll = async () => {
        const response = await fetch(`${appSettings.apiEndpoint}/sql/table/items/all`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tableName: this.indexName,
                columns: this.schema
            })
        });

        return await response.json() as ISection[];
    }
}

