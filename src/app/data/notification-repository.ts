/// <reference path="../../../src/app/data/notification-repository.d.ts"/>
import { BaseRepository } from "./base/base-repository";
import { IDbColumn, DbTypes } from './base/base-repository';

export class NotificationRepository extends BaseRepository {

    private indexName: string = "notifications";
    private schema:IDbColumn[] = [
        { type: DbTypes.Integer, name: "notificationId", isPrimaryKey: true },
        { type: DbTypes.Integer, name: "pageId", isPrimaryKey: false },
        { type: DbTypes.Integer, name: "diff", isPrimaryKey: false }
    ];

    insert = async (item: INotificationModifiable) => {
        const response = await fetch(`${appSettings.apiEndpoint}/sql/table/items/insert-identity`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tableName: this.indexName,
                columns: this.schema,
                payload: item
            })
        });

        return await response.json() as INotification;
    }

    getAllBy = async (key: keyof INotification, value:any) => {
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

        return await response.json() as INotification[];
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