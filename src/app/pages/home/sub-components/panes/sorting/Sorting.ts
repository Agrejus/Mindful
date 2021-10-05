export interface IDraggable<T> {
    index: number;
    type: DraggableType;
    data: T;
    groupId: number | null;
}


export enum DraggableType {
    HEAD = "HEAD",
    CHILD = "CHILD"
}