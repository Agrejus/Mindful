declare interface IReminder extends IReminderModifyRequest {
    reminderId: number;
}

declare interface IReminderModifyRequest {
    reminderName: string;
    content: string;
    sectionId: number;
    dueDate: string;
    isCompleted:boolean;
    remindMinutes?: number
}