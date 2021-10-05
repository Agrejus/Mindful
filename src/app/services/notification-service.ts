import { NotificationRepository } from './../data/notification-repository';
/// <reference path="../../common-types.d.ts"/>
import { Topics } from '../constants/Constants';

export interface Notification {
    onDismissClick?: () => void;
    message: string;
    timeout?: number;
}

export const hasSubscribeNotification = () =>  {
    return hasSubscribed(Topics.Notification);
}

export const subscribeNotification = (callback: (notification: Notification) => void) => {
    subscribe<Notification>(Topics.Notification, callback);
}

export const publishNotification = (notification: Notification) => {
    publish<Notification>(Topics.Notification, notification);
}

export class NotificationService {

    notificationRepository: NotificationRepository;

    constructor(pagesRepository: NotificationRepository) {
        this.notificationRepository = pagesRepository;
    }
 
    tableExists = async () => {
        return await this.notificationRepository.tableExists()
    }

    createTable = async () => {
        return await this.notificationRepository.createTable()
    }
}
