import { orderBy } from "lodash";
import { PagesRepository } from "../data/page-repository";
import { SectionsRepository } from "../data/section-repository";
import { DataSource } from "../models/DataSource";
import { onChange, parse, stringify } from "../shared-components/widgets/sections/section-widget";
import { DocumentType, IDocument, ISearchIndex } from "./services";

export class SectionsService {

    sectionsRepository: SectionsRepository;
    pagesRepository: PagesRepository;
    index: ISearchIndex;

    constructor(sectionsRepository: SectionsRepository, pagesRepository: PagesRepository, index: ISearchIndex) {
        this.sectionsRepository = sectionsRepository;
        this.pagesRepository = pagesRepository;
        this.index = index;
    }

    setWidgets = (widgets: IWidget[], targetSection: ISection, targetSectionPages: DataSource<IPage>, allSections: ISection[]) => {

        const section = { ...targetSection };

        if (!section.widgets) {
            section.widgets = [];
        }

        // initialize the widget
        for (let i = 0; i < widgets.length; i++) {
            const widget = widgets[i];
            if (section.widgets.some(w => w.type === widget.type) === false) {
                onChange(widget, targetSectionPages);
            }
        }

        section.widgets = [...widgets];
        const sections = [...allSections];
        const index = sections.findIndex(w => w.sectionId === section.sectionId);
        sections[index].widgets = section.widgets;

        return {
            sections,
            section
        }
    }

    update = async (section: ISection) => {

        const document = this.toDocument(section);
        this.index.update(document)

        const clone = { ...section };
        this.stringifyWidgets(clone);
        const updatedSection = await this.sectionsRepository.update(clone);

        this.parseWidgets(updatedSection);
        return updatedSection;
    }

    updateMany = async (sections: ISection[]) => {

        this.sectionsRepository.updateMany(sections);
    }

    insert = async (section: ISectionModifyRequest) => {
        const clone: ISection = { ...section } as any;

        this.stringifyWidgets(clone);

        const result = await this.sectionsRepository.insert(clone);

        if (!result) {
            return null;
        }

        const document = this.toDocument(result);

        this.index.add(document);

        return result;
    }

    delete = async (sectionId: number) => {

        const pages = await this.pagesRepository.getAll();
        const deletePages = pages.filter(w => w.sectionId == sectionId);

        for (let page of deletePages) {
            await this.pagesRepository.delete(page.pageId);
        }

        this.index.delete(sectionId as number)

        return await this.sectionsRepository.delete(sectionId);
    }

    get = async (sectionId: number) => {
        const result = await this.sectionsRepository.get(sectionId);

        if (!result) {
            return null;
        }

        this.parseWidgets(result);
        return result;
    }

    getAll = async () => {
        const sections = await this.sectionsRepository.getAll();

        for (let i = 0; i < sections.length; i++) {
            this.parseWidgets(sections[i])
        }

        return orderBy(sections, w => w.order);
    }

    getAllPages = async (sectionId: number | string) => {
        return await this.pagesRepository.getAllBy("sectionId", sectionId);
    }

    init = async () => {
        const all = await this.getAll();
        const sections = all.map(w => this.toDocument(w));

        this.index.addMany(sections);

        return all;
    }

    tableExists = async () => {
        return await this.sectionsRepository.tableExists()
    }

    createTable = async () => {
        return await this.sectionsRepository.createTable()
    }

    private stringifyWidgets = (section: ISection) => {
        if (section.widgets && section.widgets.length > 0) {
            section.widgets = section.widgets.map(w => { return { ...w, data: stringify(w) } });
        }
    }

    private parseWidgets = (section: ISection) => {
        if (section.widgets && section.widgets.length > 0) {
            section.widgets = section.widgets.map(w => { return { ...w, data: parse(w) } });
        }
    }

    private toDocument = (section: ISection) => {
        return {
            documentId: section.sectionId,
            name: section.sectionName,
            content: section.sectionName,
            type: DocumentType.Section
        } as IDocument
    }
}
