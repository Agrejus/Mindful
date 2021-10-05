/// <reference path="../../../src/app/data/page-repository.d.ts"/>
import { BaseRepository } from "./base/base-repository";
import { IDbColumn, DbTypes } from './base/base-repository';

export class PagesRepository extends BaseRepository {

    private indexName: string = "pages";
    private schema:IDbColumn[] = [
        { type: DbTypes.Integer, name: "pageId", isPrimaryKey: true },
        { type: DbTypes.Text, name: "pageName", isPrimaryKey: false },
        { type: DbTypes.Integer, name: "order", isPrimaryKey: false },
        { type: DbTypes.Boolean, name: "isSelected", isPrimaryKey: false },
        { type: DbTypes.Json, name: "children", isPrimaryKey: false },
        { type: DbTypes.Text, name: "content", isPrimaryKey: false },
        { type: DbTypes.Integer, name: "sectionId", isPrimaryKey: false },
        { type: DbTypes.Boolean, name: "isPinned", isPrimaryKey: false },
        { type: DbTypes.Boolean, name: "isContextMenuVisible", isPrimaryKey: false },
        { type: DbTypes.Boolean, name: "isEditing", isPrimaryKey: false },
        { type: DbTypes.Boolean, name: "isSynced", isPrimaryKey: false },
        { type: DbTypes.Text, name: "createDateTime", isPrimaryKey: false },
        { type: DbTypes.Boolean, name: "isCollapsed", isPrimaryKey: false },
        { type: DbTypes.Integer, name: "pageTypeId", isPrimaryKey: false }
    ];

    updateMany = async (pages: IPage[]) => {

        const response = await fetch(`${appSettings.apiEndpoint}/sql/table/items/updateMany`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tableName: this.indexName,
                columns: this.schema,
                payload: pages
            })
        });

        return await response.json();
    }

    updateBy = async (page: IPage, value: any, key: keyof IPage) => {

        const response = await fetch(`${appSettings.apiEndpoint}/sql/table/items/updateBy`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tableName: this.indexName,
                columns: this.schema,
                payload: {
                    item: page,
                    by: {
                        key, value
                    }
                }
            })
        });

        return await response.json();
    }

    update = async (page: IPage) => {

        const response = await fetch(`${appSettings.apiEndpoint}/sql/table/items/update`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tableName: this.indexName,
                columns: this.schema,
                payload: page
            })
        });

        return await response.json();
    }

    insert = async (page: IPageModifyRequest) => {
        const response = await fetch(`${appSettings.apiEndpoint}/sql/table/items/insert-identity`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tableName: this.indexName,
                columns: this.schema,
                payload: page
            })
        });

        return await response.json() as IPage;
    }

    deleteBy = async (value: any, key: keyof IPage) => {
        const response = await fetch(`${appSettings.apiEndpoint}/sql/table/items/delete`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tableName: this.indexName,
                columns: this.schema,
                payload: {
                    key, value
                }
            })
        });

        return await response.json() as boolean;
    }

    delete = async (pageId: number) => {
        const response = await fetch(`${appSettings.apiEndpoint}/sql/table/items/delete`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tableName: this.indexName,
                columns: this.schema,
                payload: pageId
            })
        });

        return await response.json() as boolean;
    }

    get = async (pageId: number) => {
        const response = await fetch(`${appSettings.apiEndpoint}/sql/table/items/find`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tableName: this.indexName,
                columns: this.schema,
                payload: pageId
            })
        });

        return await response.json() as IPage;
    }

    getBy = async (value: any, key: keyof IPage) => {
        const response = await fetch(`${appSettings.apiEndpoint}/sql/table/items/findBy`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tableName: this.indexName,
                columns: this.schema,
                payload: {
                    key, value
                }
            })
        });

        return await response.json() as IPage;
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

        return await response.json() as IPage[];
    }

    getAllBy = async (key: keyof IPage, value:any) => {
        const response = await fetch(`${appSettings.apiEndpoint}/sql/table/items/allBy`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tableName: this.indexName,
                columns: this.schema,
                payload: {
                    key, value
                }
            })
        });

        return await response.json() as IPage[];
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
}