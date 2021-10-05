/// <reference path="../../../src/app/data/reminder-repository.d.ts"/>
import { BaseRepository } from "./base/base-repository";

export class RemindersRepository extends BaseRepository {


    // update = (reminder: IReminder) => {
    //     this.store.set(`${reminder.reminderId}`, reminder);
    //     return this.get(reminder.reminderId);
    // }

    // insert = (reminder: IReminder) => {
    //     const data = this.store.get<{ [key: string]: any }>();

    //     reminder.reminderId = this.getNextId(data);

    //     this.store.set(`${reminder.reminderId}`, reminder);
    // }

    // delete = (reminderId: number | string) => {
    //     this.store.del(`${reminderId}`);
    // }

    // get = (reminderId: number | string) => {
    //     return this.store.get(`${reminderId}`);
    // }

    // getAll = () => {
    //     const data = this.store.get<{ [key: string]: any }>();
    //     return this.asArray(data);
    // }
}
