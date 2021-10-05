/// <reference path="../app/data/notification-repository.d.ts"/>
import { NotificationRepository } from "../app/data/notification-repository";
import { PagesRepository } from "../app/data/page-repository";

let pagesRepository = new PagesRepository();
let notificationRepository = new NotificationRepository();

self.addEventListener('message', async (e: MessageEvent) => {
    try {

        console.log('worker started')
        // Start checker
        setInterval(notificationCheck, 60000);

    } catch (e) {

    }
});

const notificationCheck = async () => {

    console.log('worker running')
    
    try {
        if (pagesRepository == null) {
            pagesRepository = new PagesRepository();
        }
    
        if (notificationRepository == null) {
            notificationRepository = new NotificationRepository();
        }
    
        const pages = await pagesRepository.getAllBy("pageTypeId", 5); // Get All Kanban boards
    
        // check for any due dates
        const notifications = pages.map(w => {
    
            if (!w.content) {
                return [];
            }
    
            const board = JSON.parse(w.content) as IBoard;
    
            if (!board.cards || !board.columns) {
                return [];
            }
    
            const now = new Date();
            const columnIds = board.columns.filter(x => x.name.toLowerCase().includes("complete") === false).map(x => x.id);
            return board.cards.map(x => {
    
                if (columnIds.includes(x.columnId) === true && !!x.dueDate) {
                    const dueDate = new Date(x.dueDate);
                    const diff = timeDiff(dueDate, now);
                    let delta = -1;

                    if (diff <= 3600000 && diff >= 0) {
                        delta = 3600000;
                    }

                    if (diff <= 900000 && diff >= 0) {
                        delta = 900000;
                    }

                    if (diff <= 90000 && diff >= 0) {
                        delta = 90000;
                    }
    
                    return {
                        diff: delta,
                        card: x,
                        page: w
                    };
                }
    
                return null;
            }).filter(w => w != null && w.diff !== -1)
        });
    
    
        if (notifications != null && notifications.length > 0) {
    
            const reducedItems: { diff: number, card: ICard, page: IPage }[] = notifications.reduce((a, b) => a.concat(b)) as any;
            const pageIds = reducedItems.map(w => w.page.pageId);
            const [sentNotifications] = await Promise.all(pageIds.map(w => notificationRepository.getAllBy("pageId", w)))
    
            reducedItems.filter(w => sentNotifications.some(x => x.pageId === w.page.pageId && x.diff === w.diff) === false).forEach(async w => {
    
                await notificationRepository.insert({
                    pageId: w.page.pageId,
                    diff: w.diff
                });
    
                self.postMessage({
                    title: `Kanban Card Due ${((w.diff / 1000) / 60)} mins`,
                    body: `${w.page.pageName}: ${w.card.name}`
                }, null as any);
            })
        }
    } catch (e) {
        console.error(e);
    }
}

const timeDiff = (d1: Date, d2: Date) => {
    return (d1 as any) - (d2 as any) as number;
}

interface IColumn {
    name: string;
    id: number;
}

interface ICard {
    name: string;
    id: number;
    content: string;
    columnId: number;
    dateAdded: Date;
    dateEdited: Date;
    priority: number | null;
    isArchived: boolean;
    comments: IComment[];
    dueDate: Date | null;
}

interface IComment {
    commentId: number;
    text: string;
    date: Date;
}

interface IBoard {
    columns: IColumn[];
    cards: ICard[]
}