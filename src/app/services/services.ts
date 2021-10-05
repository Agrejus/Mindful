import { PagesRepository } from '../data/page-repository';
import { FileSystemRepository } from '../data/interactivity-repository';
import { SectionsRepository } from '../data/section-repository';
import { RemindersRepository } from '../data/reminder-repository';
import { SectionsService } from './section-service';
import { PagesService } from './page-service';
import { InteractivityService } from './interactivity-service';
import { FlexSearch, Index } from '../../external-modules/flex-search';
import { PageType } from '../constants/Constants';
import { VisualStudioService } from '../services/visual-studio-services';
import { NotificationRepository } from '../data/notification-repository';
import { NotificationService } from './notification-service';

export enum DocumentType {
    Page,
    Section
}

export interface IPageDocumentMetaData {
    sectionId: number;
    subType: PageType
    // subType? Links Page/RTE... SearchExample  #Links emergent
    // OR #RichText Winning = search all RTE's
}

export interface IPartialDocument {
    documentId: number;
    content: string | null;
    name: string;
    type: DocumentType;
    meta?: any;
}

export interface IDocument extends IPartialDocument {
    id: number,
}

interface IIndexMappingType {
    [id: number]: number
}

interface IIndexMapping {
    nextId: number
    [type: number]: IIndexMappingType;
}

export interface ISearchIndex {
    add: (document: IPartialDocument) => void;
    addMany: (documents: IPartialDocument[]) => void;
    update: (document: IPartialDocument) => void;
    updateMany: (documents: IPartialDocument[]) => void;
    delete: (id: number) => void;
    search: (text: string) => IDocument[];
}

class SearchIndex implements ISearchIndex {

    private indexMap: IIndexMapping = { nextId: 1, };
    private index: Index<any> = FlexSearch.create({
        profile: "score",
        doc: {
            id: "id",
            field: ["content", "name", "type"]
        }
    });

    private mapAndGetIndexId(document: IPartialDocument): IDocument {
        const map = this.indexMap[document.type];

        (document as IDocument).id = this.indexMap.nextId++;

        if (!map) {
            this.indexMap[document.type] = { [document.documentId]: (document as IDocument).id };
            return (document as IDocument);
        }

        this.indexMap[document.type][document.documentId] = (document as IDocument).id;
        return (document as IDocument)
    }

    add(document: IPartialDocument) {
        this.index.add(this.mapAndGetIndexId(document))
    }

    addMany(documents: IPartialDocument[]) {
        this.index.add(documents.map(w => this.mapAndGetIndexId(w)));
    }

    update(document: IPartialDocument) {
        const id = this.indexMap[document.type][document.documentId];
        (document as IDocument).id = id;
        (this.index as any).update(document);
    }

    updateMany(documents: IPartialDocument[]) {
        const docs = documents.map(w => {
            const id = this.indexMap[w.type][w.documentId];
            return { ...w, id: id } as IDocument
        });
        (this.index as any).update(docs);
    }


    delete(id: number) {
        this.index.remove(id);
    }

    search(text: string): IDocument[] {
        return this.index.search(text) as any
    }
}

const searchIndex: ISearchIndex = new SearchIndex();

const pagesRepository = new PagesRepository();
const fileSystemRepository = new FileSystemRepository();
const sectionsRepository = new SectionsRepository();
const remindersRepository = new RemindersRepository();
const notificationRepository = new NotificationRepository();

const allServices = {
    sectionsService: new SectionsService(sectionsRepository, pagesRepository, searchIndex),
    pagesService: new PagesService(pagesRepository, searchIndex),
    fileService: new InteractivityService(fileSystemRepository),
    notificationService: new NotificationService(notificationRepository),
    visualStudioService: new VisualStudioService(),
    searchIndex: searchIndex
};

export const services = allServices;

export const initializeSearchIndex = async () => {

    const pages = await allServices.pagesService.init();
    const sections = await allServices.sectionsService.init();

    return {
        pages,
        sections
    }
}