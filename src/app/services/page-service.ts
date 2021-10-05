import { PagesRepository } from '../data/page-repository';
import { parse, stringify, stringifySearchContent } from '../shared-components/editors/Editors';
import { DocumentType, IDocument, ISearchIndex, IPageDocumentMetaData } from './services';

export class PagesService {

    pagesRepository: PagesRepository;
    index: ISearchIndex;

    constructor(pagesRepository: PagesRepository, index: ISearchIndex) {
        this.pagesRepository = pagesRepository;
        this.index = index;
    }

    update = async (page: IPage) => {

        const document = this.toDocument(page);
        this.index.update(document)

        const clone = { ...page };
        clone.content = stringify(page);
        return await this.pagesRepository.update(clone);
    }

    updateIsSelected = async (sectionId: number, selectedPageId: number) => {

        await this.pagesRepository.updateBy({ isSelected: false } as IPage, sectionId, "sectionId");
        await this.pagesRepository.updateBy({ isSelected: true } as IPage, selectedPageId, "pageId");

    }

    updateOrderMany = async (pages: IPage[]) => {
        const payload = pages.map(w => {
            return {
                pageId: w.pageId,
                isSelected: w.isSelected,
                order: w.order,
                children: w.children,
                isCollapsed: w.isCollapsed
            } as IPage;
        }); // ensure we don't over send data/properties

        const result: IPage[] = await this.pagesRepository.updateMany(payload);

        return result.map(w => {
            w.content = parse(w);
            return w;
        });
    }

    insert = async (page: IPageModifyRequest) => {
        const clone: IPage = { ...page } as any;
        clone.content = stringify(page);
        const result = await this.pagesRepository.insert(clone);

        if (!result) {
            return null;
        }

        result.content = parse(result);
        const document = this.toDocument(result);
        this.index.add(document);

        return result;
    }

    insertRaw = async (page: IPageModifyRequest) => {
        return await this.pagesRepository.insert(page);
    }

    delete = async (pageId: number) => {

        this.index.delete(pageId as number);

        return await this.pagesRepository.delete(pageId);
    }

    get = async (pageId: number) => {
        const page = await this.pagesRepository.get(pageId);

        if (!page) {
            return null;
        }

        page.content = parse(page);
        return page;
    }

    getAll = async () => {
        const pages = await this.pagesRepository.getAll();
        return pages.map(w => { return { ...w, content: parse(w) } }) as IPage[]
    }

    getAllBySectionId = async (sectionId: number) => {
        const pages = await this.pagesRepository.getAllBy("sectionId", sectionId);
        return pages.map(w => { return { ...w, content: parse(w) } }) as IPage[]
    }

    init = async () => {
        const all = await this.getAll();
        const pages = all.map(w => this.toDocument(w));
        this.index.addMany(pages);

        return all;
    }

    tableExists = async () => {
        return await this.pagesRepository.tableExists()
    }

    createTable = async () => {
        return await this.pagesRepository.createTable()
    }

    private toDocument = (page: IPage) => {
        return {
            type: DocumentType.Page,
            documentId: page.pageId,
            name: page.pageName,
            content: stringifySearchContent(page.pageTypeId, page.content),
            meta: {
                sectionId: page.sectionId,
                subType: page.pageTypeId
            } as IPageDocumentMetaData
        } as IDocument
    }
}
