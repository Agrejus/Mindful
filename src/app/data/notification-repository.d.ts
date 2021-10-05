declare interface INotification extends INotificationModifiable {
    notificationId: number;
}

declare interface INotificationModifiable {
    pageId: number;
    diff: number;
}