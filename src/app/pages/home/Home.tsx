/// <reference path="../../data/section-repository.d.ts" />
/// <reference path="../../data/page-repository.d.ts" />
/// <reference path="../../data/reminder-repository.d.ts" />
/// <reference path="../../shared-components/widgets/widgets.d.ts" />
/// <reference path="../../../../common-types.d.ts" />
import * as React from 'react';
import './Home.scss';
import '../../../../node_modules/@progress/kendo-theme-default/dist/all.scss';
import { SplitterPaneProps } from '@progress/kendo-react-layout';
import { SortableOnDragOverEvent } from '@progress/kendo-react-sortable';
import { SplitPane } from '../../shared-components/panes/split/SplitPane';
import { Pane } from '../../shared-components/panes/split/Pane';
import { PageContentPane } from './sub-components/panes/PageContentPane';
import { ButtonType } from '../../shared-components/modal/Modal';
import { initializeSearchIndex, services } from '../../services/services';
import { ReminderModal } from './sub-components/ReminderModal';
import { ChangeSectionColorModal } from './sub-components/ChangeSectionColorModal';
import { debounce, DebouncedFunc, orderBy } from 'lodash';
import * as moment from 'moment';
import { SectionsPane } from './sub-components/panes/SectionsPane';
import { PagesPane } from './sub-components/panes/PagesPane';
import { PageType } from '../../constants/Constants';
import { getDefaultContent, render } from '../../shared-components/editors/Editors';
import { onChange } from '../../shared-components/widgets/sections/section-widget';
import { SearchResultRenderer } from './sub-components/search/SearchResultRenderer';
import { Portal } from '../../shared-components/modal/Portal';
import { JsonPrettyPrint } from '../../shared-components/tools/json-pretty-print/JsonPrettyPrint';
import { CSharpToTypescript } from '../../shared-components/tools/c-sharp-to-typescript/CSharpToTypescript';
import { TreeNode } from 'react-draggable-tree';
import { DataSource } from '../../models/DataSource';
import NotificationWorker from "worker-loader!../../../workers/notification-worker";

type Tools = "JsonPrettyPrint" | "CSharpToTypescript"

interface Props {

}

interface Navigation {
    sectionId: number;
    pageId?: number;
    isActive: boolean;
}

export interface State {
    sections: ISection[];
    pages: DataSource<IPage>;
    reminders: IReminder[];
    selectedSection: ISection | null | undefined;
    selectedPage: IPage | null | undefined;
    isCreatingNewSection: boolean;
    createNewPageTypeId: PageType | null;
    changeColorSection: ISection | null;
    changeColorPage: IPage | null;
    selectedReminder: IReminder | null | undefined;
    navigationItems: Navigation[];
    searchText: string;
    visibleTool: Tools | null;
    pagesPaneTreeRoot: TreeNode | null;
    pagesPaneSelectedKeys: Set<number>;
    showArchivedSections: boolean;
}

export class Home extends React.PureComponent<Props, State> {

    panes: SplitterPaneProps[] = [
        { size: '220px', min: '125px', collapsible: true },
        { size: '250px', min: '150px', collapsible: true },
        { min: '100px', collapsible: true }
    ];


    notificationWorker: NotificationWorker;

    constructor(props: Props) {
        super(props);
        this.notificationWorker = new NotificationWorker();
        this.state = {
            sections: [],
            reminders: [],
            selectedSection: null,
            selectedPage: null,
            isCreatingNewSection: false,
            createNewPageTypeId: null,
            changeColorSection: null,
            changeColorPage: null,
            selectedReminder: null,
            navigationItems: [],
            searchText: "",
            visibleTool: null,
            pages: new DataSource<IPage>("pageId"),
            pagesPaneTreeRoot: null,
            pagesPaneSelectedKeys: new Set<number>([]),
            showArchivedSections: false
        }

        this.updateSectionDebounced = debounce(services.sectionsService.update, 1500);
        this.updatePageDebounced = debounce(this.updatePage, 400);
        this.updateSectionsDebounced = debounce(services.sectionsService.updateMany, 500);
        this.syncPageDebounced = debounce(services.pagesService.update, 2000);
        this.updatePagesSkinnyDebounced = debounce(services.pagesService.updateOrderMany, 350);


        try {
            this.notificationWorker.onmessage = e => {
                window.api.send("notification", { ...e.data })
            }

            this.notificationWorker.onerror = e => {
                debugger;
            }

            this.notificationWorker.postMessage("start", null as any);
        } catch (e) {
            debugger;
        }
    }

    domActionables: IDomActionable[] = [];
    pagesPane: PagesPane | null = null;
    sectionsPane: SectionsPane | null = null;
    updatePageDebounced: DebouncedFunc<(page: IPage) => Promise<void>>;
    updatePagesSkinnyDebounced: DebouncedFunc<(pages: IPageSkinnyRequest[]) => Promise<IPage[]>>;
    syncPageDebounced: DebouncedFunc<(page: IPage) => Promise<IPage>>;
    updateSectionsDebounced: DebouncedFunc<(sections: ISection[]) => Promise<void>>;
    updateSectionDebounced: DebouncedFunc<(sections: ISection) => Promise<ISection>>;

    createRoot = (dictionary: DataSource<IPage>): TreeNode => {

        const childPageIds = !dictionary.length ? [] : dictionary.map(w => w.children).reduce((a, b) => a.concat(b))
        const rootPageIds = dictionary.map(w => w.pageId).filter(w => childPageIds.includes(w) === false);

        return {
            children: rootPageIds && rootPageIds.map(w => {
                const page = dictionary.get(w);
                return this.toTreeNode(page, dictionary);
            }),
            key: -1,
            collapsed: true
        }
    }

    toTreeNode = (item: IPage, dictionary: DataSource<IPage>): TreeNode => {
        return {
            children: item.children.length > 0 ? item.children.map(w => {
                const page = dictionary.get(w);
                return this.toTreeNode(page, dictionary);
            }) : [],
            key: item.pageId,
            collapsed: item.isCollapsed,
            order: item.order
        } as TreeNode;
    }

    componentWillUnmount() {
        this.notificationWorker.terminate();
    }

    async componentDidMount() {

        // const x = services.pagesService.search("TODO");

        // Move to express instead of here
        initializeSearchIndex();

        // allow for linking to pages and sections
        document.addEventListener("click", (e) => {

            if (e.target == null) {
                return;
            }

            if (e.target != null && (e.target as HTMLElement).tagName === "A") {
                const link = (e.target as HTMLElement).attributes.getNamedItem("data-link");

                if (link != null && link.value != "") {
                    const split = link.value.split(":");
                    // this.onSelectPageClick(split[1] as any)
                }
            }

            for (let i = 0; i < this.domActionables.length; i++) {
                const actionable = this.domActionables[i];
                if (actionable.canIgnore && actionable.canIgnore(e)) {
                    continue;
                }
                actionable.action();
            }
        });

        const sections = await services.sectionsService.getAll();

        if (sections.length === 0) {
            return;
        }

        const orderedSections = orderBy(sections, w => w.order);
        const selectedSection = sections.find(w => w.isSelected === true);

        if (!selectedSection) {
            this.setState({
                sections: orderedSections
            });
            return;
        }

        const allPages = await services.pagesService.getAllBySectionId(selectedSection.sectionId);
        const reminders = [] as IReminder[];
        const pages = new DataSource<IPage>("pageId", allPages);
        const pagesPaneTreeRoot = this.createRoot(pages);
        const pagesPaneSelectedKeys = new Set<number>(pages.filter(w => w.isSelected === true).map(w => w.pageId));
        const selectedPage = pages.find(w => w.isSelected === true);


        this.setState({
            pages,
            pagesPaneTreeRoot,
            pagesPaneSelectedKeys,
            selectedPage,
            sections: orderedSections,
            selectedSection,
            reminders,
            navigationItems: [{ sectionId: selectedSection.sectionId, pageId: selectedPage?.pageId, isActive: true }]
        });
    }

    addNavigation = (sectionId: number, pageId?: number) => {
        const items = [...this.state.navigationItems];
        const activeIndex = items.findIndex(w => w.isActive === true);
        const nextIndex = activeIndex + 1;

        const count = nextIndex - (items.length - 1)
        items.splice(nextIndex, count)
        items.push({ sectionId, pageId, isActive: true });

        this.setState({
            navigationItems: items
        });
    }

    updatePage = async (page: IPage) => {
        const pages = this.state.pages.clone();

        if (pages.set(page)) {
            this.setState({
                pages
            });
        }

        this.syncPageDebounced(page);
    }

    updatePages = async (data: IPage[]) => {
        const pages = this.state.pages.clone();
        let selectedPage: IPage | null | undefined = null;

        for (let page of data) {

            if (page.isSelected) {
                selectedPage = page;
            }

            pages.set(page);
        }

        this.setState({
            pages,
            selectedPage
        });

        this.updatePagesSkinnyDebounced(pages.toList());
    }

    onChange = async (content: any) => {

        if (!this.state.selectedPage) {
            return;
        }

        const section = this.state.selectedSection;

        if (!section) {
            return;
        }

        const page = this.state.selectedPage;
        page.content = content;
        let newState: Pick<State, any> = {
            selectedPage: { ...page }
        }

        // move to worker?
        if (section.widgets && section.widgets.length > 0) {

            for (let i = 0; i < section.widgets.length; i++) {
                const widget = section.widgets[i];
                onChange(widget, this.state.pages);
            }

            this.updateSectionDebounced(section);

            newState.selectedSection = { ...section };

            const sections = this.state.sections;
            const index = this.state.sections.findIndex(w => w.sectionId === section.sectionId);

            sections[index].widgets = section.widgets;
            newState = {
                ...newState,
                selectedSection: { ...section },
                sections: [...sections]
            };
        }

        this.setState(newState);

        this.updatePageDebounced(page);
    }

    onSectionDrag = (event: SortableOnDragOverEvent) => {
        const sections = event.newState as ISection[];

        for (let i = 0; i < sections.length; i++) {
            sections[i].order = i + 1;
        }

        this.setState({
            sections: orderBy(sections, w => w.order)
        });

        this.updateSectionsDebounced(sections);
    }

    onSelectSectionClick = async (sectionId: number) => {

        const selectedSection = this.state.sections.find(w => w.sectionId === sectionId);

        if (!selectedSection) {
            return;
        }

        if (selectedSection.sectionId !== this.state.selectedSection?.sectionId) {

            const allPages = await services.pagesService.getAllBySectionId(selectedSection.sectionId);
            const pages = new DataSource("pageId", allPages);
            const pagesPaneTreeRoot = this.createRoot(pages);
            const reminders = [] as IReminder[];//await getReminders(selectedSection.sectionId);
            const sections = this.state.sections.map(w => { return { ...w, isSelected: w.sectionId === sectionId } });
            const selectedPage = pages.find(w => w.isSelected === true);

            selectedSection.isSelected = true;

            this.addNavigation(selectedSection.sectionId, selectedPage?.pageId);

            this.setState({
                selectedSection,
                selectedPage,
                pages,
                reminders,
                pagesPaneTreeRoot,
                pagesPaneSelectedKeys: new Set<number>(pages.filter(w => w.isSelected === true).map(w => w.pageId))
            });
            this.updateSectionsDebounced(sections);
            return;
        }

        this.setState({
            selectedSection
        });
    }

    onCreateNewSection = async (name: string) => {

        // unselect current section
        const selectedSections = this.state.sections.filter(w => w.isSelected === true).map(w => {
            return { ...w, isSelected: false }
        });

        await services.sectionsService.updateMany(selectedSections);

        const newSection = await services.sectionsService.insert({
            sectionName: name,
            isDisabled: false,
            color: "green",
            order: -1,
            createDateTime: moment().format(),
            isSelected: true,
            widgets: [],
            isArchived: false,
            settings: {}
        });

        if (!newSection) {
            return;
        }


        const sections = await services.sectionsService.getAll();

        this.setState({
            isCreatingNewSection: false,
            sections,
            pages: new DataSource<IPage>("pageId"),
            selectedSection: newSection,
            selectedPage: null
        });
    }

    onDeleteSection = async (sectionId: number) => {
        const { selectedSection, selectedPage, pages } = this.state;

        await services.sectionsService.delete(sectionId);

        const sections = await services.sectionsService.getAll();

        this.setState({
            sections,
            selectedSection: selectedSection?.sectionId === sectionId ? null : selectedSection,
            selectedPage: selectedSection?.sectionId === sectionId ? null : selectedPage,
            pages: selectedSection?.sectionId === sectionId ? new DataSource<IPage>("pageId") : pages
        });
    }

    onDeletePage = async (pageId: number) => {

        if (!this.state.selectedSection) {
            return;
        }

        const pages = this.state.pages.clone();
        const selectedSection = { ...this.state.selectedSection };
        const pageToDelete = pages.get(pageId);

        if (!pageToDelete) {
            return;
        }

        await services.pagesService.delete(pageId);

        const updatedPages = await services.pagesService.getAllBySectionId(pageToDelete.sectionId);

        await services.sectionsService.update(selectedSection);

        const allPages = new DataSource<IPage>("pageId", updatedPages);
        const pagesPaneTreeRoot = this.createRoot(allPages);
        const pagesPaneSelectedKeys = new Set<number>(allPages.filter(w => w.isSelected === true).map(w => w.pageId));
        const selectedPage = allPages.find(w => w.isSelected === true);

        // going to have tree root issues here, need to delete the appropriate children

        this.setState({
            pages: allPages,
            selectedSection,
            pagesPaneTreeRoot,
            pagesPaneSelectedKeys,
            selectedPage
        });
    }

    onCreateNewPage = async (name: string) => {

        if (!this.state.selectedSection || !this.state.createNewPageTypeId) {
            return;
        }

        const selectedSection = { ...this.state.selectedSection }
        const sectionId = selectedSection.sectionId;
        const page = await services.pagesService.insert({
            sectionId: sectionId,
            pageName: name,
            isPinned: false,
            content: getDefaultContent(this.state.createNewPageTypeId),
            createDateTime: moment().format(),
            order: 0,
            pageTypeId: this.state.createNewPageTypeId,
            isSelected: false,
            children: [],
            isCollapsed: true
        });

        if (!page) {
            return;
        }

        await services.sectionsService.update(selectedSection);

        const pages = this.state.pages.clone();
        pages.add(page);
        const pagesPaneTreeRoot = this.createRoot(pages);

        this.setState({
            createNewPageTypeId: null,
            pages,
            pagesPaneTreeRoot,
            selectedSection
        });
    }

    onChangeSectionColorClick = (sectionId: number) => {
        const section = this.state.sections.find(w => w.sectionId === sectionId);

        if (!section) {
            return;
        }

        this.setState({ changeColorSection: section });
    }

    onChangeSectionColorHandler = async (buttonType: ButtonType, color?: string) => {

        const { sections } = this.state;

        if (!this.state.changeColorSection) {
            return;
        }

        const index = this.state.sections.findIndex(w => w.sectionId === this.state.changeColorSection?.sectionId);

        if (index === -1) {
            return;
        }

        if (buttonType === "Ok" && color) {

            sections[index].color = color;

            this.setState({ sections: [...sections], changeColorSection: null });
            await services.sectionsService.update(sections[index]);
            return;
        }

        // reset color
        const savedSections = await services.sectionsService.getAll();
        const foundSection = savedSections.find(w => w.sectionId === this.state.changeColorSection?.sectionId);

        if (!foundSection) {
            return;
        }

        sections[index] = foundSection;

        this.setState({ sections: [...sections], changeColorSection: null });
        return;
    }

    onColorChange = (color: string) => {
        const { sections } = this.state;
        const index = this.state.sections.findIndex(w => w.sectionId === this.state.changeColorSection?.sectionId);

        if (index === -1) {
            return;
        }

        sections[index].color = color;

        this.setState({ sections: [...sections] });
    }

    reminderHandler = async (buttonType: ButtonType) => {

        if (!this.state.selectedReminder || !this.state.selectedSection) {
            return;
        }

        if (buttonType === "Ok") {

            if (this.state.selectedReminder.reminderId == 0) {
                return
            }

            // Update Reminder
            const index = this.state.reminders.findIndex(w => w.reminderId === this.state.selectedReminder!.reminderId);

            if (index === -1) {
                return;
            }

            this.state.reminders[index] = this.state.selectedReminder
            const reminder = this.state.reminders[index];
            // await updateReminder(reminder);
            // const fetchedReminders = await getReminders(this.state.selectedSection.sectionId);

            this.setState({
                selectedReminder: null,
                //reminders: [...fetchedReminders]
            });
            return;
        }

        this.setState({
            selectedReminder: null
        });
    }

    onNewReminderClick = () => {

        if (!this.state.selectedSection) {
            return;
        }

        this.setState({
            selectedReminder: {
                content: "",
                dueDate: "",
                reminderId: 0,
                reminderName: "",
                sectionId: this.state.selectedSection.sectionId,
                isCompleted: false
            }
        });
    }

    onToggleContextMenu = () => {
        this.pagesPane?.hideAllVisibleMenus();
        this.sectionsPane?.hideAllVisibleMenus();
    }

    onBackClick = () => {
        const items = [...this.state.navigationItems];
        let currentIndex = items.findIndex(w => w.isActive === true);

        if (currentIndex === 0) {
            return;
        }

        items[currentIndex].isActive = false;
        currentIndex--;
        items[currentIndex].isActive = true;

        this.setState({
            navigationItems: items
        });
    }

    onForwardClick = () => {
        const items = [...this.state.navigationItems];
        let currentIndex = items.findIndex(w => w.isActive === true);

        if (currentIndex === (items.length - 1)) {
            return;
        }

        items[currentIndex].isActive = false;
        currentIndex++;
        items[currentIndex].isActive = true;

        this.setState({
            navigationItems: items
        });
    }

    onWidgetsChange = (widgets: IWidget[]) => {

        if (!this.state.selectedSection) {
            return;
        }

        const updateResult = services.sectionsService.setWidgets(widgets,
            this.state.selectedSection,
            this.state.pages,
            this.state.sections);

        this.updateSectionDebounced(updateResult.section);

        this.setState({
            selectedSection: updateResult.section,
            sections: updateResult.sections
        });
    }

    onSectionChange = (section: ISection) => {

        const index = this.state.sections.findIndex(w => w.sectionId === section.sectionId);

        if (index === -1) {
            return;
        }

        const sections = [...this.state.sections];

        sections[index] = { ...section };

        const newState: Pick<State, any> = {
            sections
        };

        if (this.state.selectedSection?.sectionId === section.sectionId) {
            newState.selectedSection = { ...section };
        }

        this.updateSectionDebounced(section);

        this.setState(newState);
    }

    onSectionWidgetsChange = async (section: ISection, widgets: IWidget[]) => {

        let pages: DataSource<IPage>;
        const isCurrentSection = this.state.selectedSection?.sectionId === section.sectionId;

        if (isCurrentSection) {
            pages = this.state.pages;
        } else {
            const allPages = await services.pagesService.getAllBySectionId(section.sectionId);
            pages = new DataSource<IPage>("pageId", allPages);
        }

        const updateResult = services.sectionsService.setWidgets(widgets,
            section,
            pages,
            this.state.sections);

        this.updateSectionDebounced(updateResult.section);

        const newState: Pick<State, any> = {
            sections: updateResult.sections
        };

        if (isCurrentSection) {
            newState.selectedSection = updateResult.section;
        }

        this.setState(newState);
    }

    goToPageFromSearch = (pageId: number) => {
        this.setState({ searchText: "" });
        // this.onSelectPageClick(pageId);
    }

    goToSectionFromSearch = (sectionId: number) => {
        this.setState({ searchText: "" });
        this.onSelectSectionClick(sectionId);
    }

    renderSearch = () => {
        if (this.state.searchText.length <= 2) {
            return null;
        }

        //const sections = await services.sectionsService.getAll();
        const results = services.searchIndex.search(this.state.searchText);
        return <SearchResultRenderer
            documents={results}
            goToPageFromSearch={this.goToPageFromSearch}
            goToSectionFromSearch={this.goToSectionFromSearch}
            searchText={this.state.searchText}
            allSections={[]}
        />
    }

    onPagesPaneTreeChange = (root: TreeNode, selectedKeys: Set<number>) => {
        this.setState({
            pagesPaneTreeRoot: root,
            pagesPaneSelectedKeys: selectedKeys
        })
    }

    renderVisibleTool = () => {

        if (this.state.visibleTool === "CSharpToTypescript") {
            return <CSharpToTypescript
                onClose={() => this.setState({ visibleTool: null })}
            />
        }

        if (this.state.visibleTool === "JsonPrettyPrint") {
            return <JsonPrettyPrint
                onClose={() => this.setState({ visibleTool: null })}
            />
        }

       return null
    }

    render(): React.ReactNode {
        const canNavigateBack = this.state.navigationItems.length > 0 && this.state.navigationItems[0].isActive === false;
        const canNavigateForward = this.state.navigationItems.length > 0 && this.state.navigationItems[this.state.navigationItems.length - 1].isActive === false;
        return <React.Fragment>

            <div id="full-modal-portal"></div>

            <div className="sub-header">
                <i className={`bi bi-caret-left-square clickable${canNavigateBack === false ? " icon-disabled" : ""}`} onClick={this.onBackClick}></i>
                <i className={`bi bi-caret-right-square clickable${canNavigateForward === false ? " icon-disabled" : ""}`} onClick={this.onForwardClick}></i>
                <i className="bi bi-arrow-counterclockwise clickable"></i>
                <i className="bi bi-arrow-clockwise clickable"></i>
                <span className="separator"></span>
                <span>Sections&emsp;</span>
                <i className="bi bi-archive-fill clickable" onClick={() => this.setState({ showArchivedSections: !this.state.showArchivedSections })}></i>
                <span className="separator"></span>
                <i className="bi bi-braces clickable" onClick={() => this.setState({ visibleTool: "JsonPrettyPrint" })}></i>
                <i className="bi bi-arrow-left-right clickable" onClick={() => this.setState({ visibleTool: "CSharpToTypescript" })}></i>
                <input className="form-control pull-right" type="text" placeholder="Search..." value={this.state.searchText} onChange={e => this.setState({ searchText: e.target.value })} />
            </div>
            <div className="page-container" id="home-page-container">
                {this.renderSearch()}
                <SplitPane panes={this.panes} orientation="horizontal">
                    <Pane className="sections-content-pane">
                        <SectionsPane
                            showArchivedSections={this.state.showArchivedSections}
                            ref={e => this.sectionsPane = e}
                            onShowContextMenu={this.onToggleContextMenu}
                            onDelete={this.onDeleteSection}
                            isCreatingNewSection={this.state.isCreatingNewSection}
                            onChangeColorClick={this.onChangeSectionColorClick}
                            onCreate={this.onCreateNewSection}
                            onDragOver={this.onSectionDrag}
                            onNavigate={this.onSectionDrag}
                            onIsCreatingNewSectionChange={e => this.setState({ isCreatingNewSection: e })}
                            onSelect={this.onSelectSectionClick}
                            sections={this.state.sections}
                            selectedSection={this.state.selectedSection}
                            onSectionChange={this.onSectionChange}
                            onSectionWidgetsChange={this.onSectionWidgetsChange}
                        />
                    </Pane>
                    <Pane className="pages-content-pane">
                        {this.state.selectedSection && this.state.pagesPaneTreeRoot && <PagesPane
                            onChanges={this.updatePages}
                            onChange={this.updatePage}
                            ref={e => this.pagesPane = e}
                            onToggleContextMenu={this.onToggleContextMenu}
                            onDelete={this.onDeletePage}
                            createNewPageType={this.state.createNewPageTypeId}
                            pages={this.state.pages}
                            onCreate={this.onCreateNewPage}
                            onIsCreatingNewPageChange={e => this.setState({ createNewPageTypeId: e })}
                            selectedPage={this.state.selectedPage}
                            treeRoot={this.state.pagesPaneTreeRoot}
                            selectedKeys={this.state.pagesPaneSelectedKeys}
                            onTreeChange={this.onPagesPaneTreeChange}
                        />}
                    </Pane>
                    <Pane>
                        {this.state.selectedPage && <PageContentPane
                            pageType={this.state.selectedPage.pageTypeId}
                            subTitle={moment(this.state.selectedPage.createDateTime).format(appSettings.defaultLongDateFormat)}
                            title={this.state.selectedPage.pageName}
                            onWidgetsChange={this.onWidgetsChange}
                            section={this.state.selectedSection}
                        >
                            {render(this.state.selectedPage.pageTypeId, {
                                content: this.state.selectedPage.content,
                                onChange: this.onChange,
                                registerDomClickActions: actions => this.domActionables = actions
                            })}
                        </PageContentPane>}
                    </Pane>
                </SplitPane>
                {this.state.changeColorSection && <ChangeSectionColorModal
                    onClick={this.onChangeSectionColorHandler}
                    onColorChange={this.onColorChange}
                    color={this.state.changeColorSection.color}
                />}
                {this.state.selectedReminder && <ReminderModal
                    reminder={this.state.selectedReminder}
                    onClick={this.reminderHandler}
                    onChange={e => this.setState({ selectedReminder: e })}
                />}
                <Portal id="full-modal-portal">
                    {this.renderVisibleTool()}
                </Portal>
            </div>
        </React.Fragment>
    }
}