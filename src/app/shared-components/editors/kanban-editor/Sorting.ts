export interface IDraggable<T> {
    index: number;
    type: DraggableType;
    data: T;
}


export enum DraggableType {
    COLUMN = "COLUMN",
    CARD = "CARD",
    CARD_DROP_AREA = "CARD_DROP_AREA"
}

export interface IColumn {
    name: string;
    id: number;
}

export interface ICard {
    name: string;
    id: number;
    content: string;
    columnId: number;
    dateAdded: Date;
    dateEdited: Date;
    priority: number | null;
    isArchived: boolean;
    comments: IComment[];
    dueDate: string | null;
}

export interface IComment {
    commentId: number;
    text: string;
    date: Date;
}

export interface IBoard {
    columns: IColumn[];
    cards: ICard[]
}