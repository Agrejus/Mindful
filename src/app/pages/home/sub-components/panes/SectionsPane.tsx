import * as React from 'react';
import { Sortable, SortableOnDragOverEvent, SortableOnNavigateEvent } from '@progress/kendo-react-sortable';
import { NavigationButton } from '../../../../shared-components/buttons/NavigationButton';
import { CreatableNavButton } from '../../../../shared-components/buttons/CreatableNavButton';
import { ContextMenu, ContextMenuItem, IContextMenu } from '../../../../shared-components/context-menu/ContextMenu';
import { ButtonType, Modal } from '../../../../shared-components/modal/Modal';
import { SectionWidgetContainer } from '../../../../shared-components/widgets/sections/SectionWidgetContainer';
import { AddWidgetModal } from './sub-components/modals/AddWidgetModal';
import { RenameSectionModal } from './sub-components/modals/RenameSectionModal';
import { Portal } from '../../../../shared-components/modal/Portal';
// Swap Sortable - https://codesandbox.io/s/blazing-monad-whes0?file=/src/index.js
// Swap Sortable - https://github.com/clauderic/react-sortable-hoc

interface Props {
    sections: ISection[];
    selectedSection: ISection | null | undefined;
    isCreatingNewSection: boolean;
    onIsCreatingNewSectionChange: (value: boolean) => void;
    onChangeColorClick: (sectionId: number) => void;
    onSelect: (sectionId: number) => void;
    onDragOver: (e: SortableOnDragOverEvent) => void;
    onNavigate: (e: SortableOnNavigateEvent) => void;
    onCreate: (name: string) => void;
    onDelete: (id: number) => void;
    onShowContextMenu: () => void;
    onSectionChange: (section: ISection) => void;
    onSectionWidgetsChange: (section: ISection, widgets: IWidget[]) => void;
    showArchivedSections: boolean;
}

interface State {
    isSectionConfirmModalVisible: boolean;
    deleteSection: ISection | null;
    widgetSection: ISection | null;
    renameSection: ISection | null;
    settingsSection: ISection | null;
}

export class SectionsPane extends React.PureComponent<Props, State> {

    state: State = {
        isSectionConfirmModalVisible: false,
        deleteSection: null,
        widgetSection: null,
        renameSection: null,
        settingsSection: null
    }

    contextMenus: IContextMenu[] = []

    componentDidMount() {

        document.addEventListener("click", e => {

            const target = e.target as any;

            if (target instanceof HTMLAnchorElement && (target as HTMLAnchorElement).classList.contains("context-menu-item") === false) {
                this.hideAllVisibleMenus();
            }

            if (target instanceof HTMLDivElement && (target as HTMLDivElement).classList.contains("context-menu") === false) {
                this.hideAllVisibleMenus();
            }
        });
    }

    hideAllVisibleMenus = () => {
        const visibleMenus = this.contextMenus.filter(w => w.visible() === true);
        for (let contextMenu of visibleMenus) {
            contextMenu.hide();
        }
    }

    onDeletePageClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, data: ISection) => {
        e.preventDefault();
        this.setState({
            deleteSection: data
        });
    }

    onRenamePageClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, data: ISection) => {
        e.preventDefault();
        this.setState({
            renameSection: data
        });
    }

    onSettingsPageClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, data: ISection) => {
        e.preventDefault();

        if (!data.settings) {
            data.settings = {
                url: ""
            }
        }

        this.setState({ settingsSection: data });
    }

    onWidgetClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, data: ISection) => {
        e.preventDefault();
        this.setState({
            widgetSection: data
        });
    }

    handleModalClick = (button: ButtonType) => {

        if (button === "Cancel" || !this.state.deleteSection) {
            this.setState({
                deleteSection: null
            });
            return;
        }

        this.props.onDelete(this.state.deleteSection.sectionId);
        this.setState({ deleteSection: null });
    }

    onChangeColorClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, data: ISection) => {
        e.preventDefault();
        this.props.onChangeColorClick(data.sectionId);
    }

    getFaviconUrl = (section: ISection) => {
        if (!section?.settings?.url) {
            return ""
        }

        return section.settings.url;
    }

    onSettingsChange = (section: ISection, property: keyof ISectionSettings, value: any) => {
        const clone = { ...section, settings: { ...section.settings } };
        clone.settings[property] = value;

        this.setState({
            settingsSection: clone
        })
    }

    onArchiveClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, data: ISection) => {
        e.preventDefault();
        const clone = { ...data };
        clone.isArchived = true

        this.props.onSectionChange(clone);
    }

    onSaveSettingsSection = () => {
        if (this.state.settingsSection) {
            this.props.onSectionChange({ ...this.state.settingsSection });
        }

        this.setState({
            settingsSection: null
        });
    }

    render() {

        const buildContextMenuItems = (data: ISection): ContextMenuItem<ISection>[] => {
            const widgetsIcon = data.widgets && data.widgets.length > 0 ? "bi bi-app-indicator" : "bi bi-app";
            return [
                { text: "Rename", onClick: this.onRenamePageClick, data, icon: "fas fa-i-cursor" },
                { text: "Change Color", onClick: this.onChangeColorClick, data, icon: "fas fa-palette" },
                { text: "Widgets", onClick: this.onWidgetClick, data, icon: widgetsIcon },
                { text: "Archive", onClick: this.onArchiveClick, data, icon: "fas fa-archive" },
                { text: "Settings", onClick: this.onSettingsPageClick, data, icon: "fa fa-cogs" },
                { text: "Delete", onClick: this.onDeletePageClick, data, icon: "far fa-trash-alt text-danger" }
            ]
        }

        const sections = this.props.showArchivedSections ? this.props.sections : this.props.sections.filter(w => w.isArchived === false);

        return <React.Fragment>
            {this.props.isCreatingNewSection === true && <CreatableNavButton key={"new-section"} defaultText="New Section" color="green" onSave={this.props.onCreate} />}
            {this.props.sections && this.props.sections.length > 0 && <Sortable
                idField={'sectionId'}

                disabledField={'isDisabled'}
                data={sections}

                itemUI={e => <ContextMenu<ISection>
                    onShow={this.props.onShowContextMenu}
                    ref={e => { if (e) { this.contextMenus.push(e); } }}
                    contextMenuItems={buildContextMenuItems(e.dataItem)}
                >
                    <NavigationButton
                        isEditing={false}
                        onEditComplete={() => void (0)}
                        displayField="sectionName"
                        color={e.dataItem.color}
                        icon={e.dataItem.icon}
                        isSelected={this.props.selectedSection?.sectionId === e.dataItem.sectionId}
                        key={`section-key-${e.dataItem.sectionId}`}
                        {...e}
                        idField={'sectionId'}
                        onClick={this.props.onSelect}
                        favicon={e.dataItem?.settings?.url}
                        className={e.dataItem.isArchived === true ? "nav-button-archived" : ""}
                    >
                        <SectionWidgetContainer widgets={e.dataItem.widgets} />
                    </NavigationButton>
                </ContextMenu>}

                onDragOver={this.props.onDragOver}
            />}
            <button className="nav-button nav-button-add" onClick={() => this.props.onIsCreatingNewSectionChange(true)}><i className="bi bi-plus icon-md"></i>&nbsp;Add Section</button>
            {this.state.deleteSection && <Modal
                buttons={["Yes", "Cancel"]}
                onClick={this.handleModalClick}
                title="Delete Section?"
            >
                <p>Are you sure you wish to delete {this.state.deleteSection.sectionName} and its pages?</p>
            </Modal>}
            {this.state.widgetSection != null && <AddWidgetModal
                widgets={this.state.widgetSection.widgets}
                titlePrefix="Sections"
                onChange={e => this.props.onSectionWidgetsChange(this.state.widgetSection!, e)}
                onClose={() => this.setState({ widgetSection: null })}
            />}
            {this.state.renameSection && <RenameSectionModal
                section={this.state.renameSection}
                onSave={this.props.onSectionChange}
                onClose={() => this.setState({ renameSection: null })}
            />}

            <Portal id="full-modal-portal">
                {this.state.settingsSection && <React.Fragment>
                    <i className="bi bi-x-circle clickable" onClick={() => { this.setState({ settingsSection: null }) }}></i>
                    <h1>{this.state.settingsSection.sectionName} Settings</h1>
                    <hr />
                    <div className="row">
                        <div className="col-sm-12">
                            <label className="full-width">Section Name: </label>
                            <input type="text" className="form-control" value={this.state.settingsSection.sectionName} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <label className="full-width">Company Url: </label>
                            <input type="text" className="form-control" onChange={e => this.onSettingsChange(this.state.settingsSection!, "url", e.target.value)} value={this.state.settingsSection.settings.url} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <label className="full-width">Color: </label>
                            <div style={{ width: "50px", display: "inline-block", borderRadius: "8px", backgroundColor: this.state.settingsSection.color }}>&emsp;</div>&emsp;
                            <button className="btn btn-secondary">Change Color</button>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <label className="full-width">Widgets: </label>
                            <input type="text" className="form-control" value={this.state.settingsSection.color} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <button className="btn btn-success" onClick={this.onSaveSettingsSection}>Save</button>
                        </div>
                    </div>
                </React.Fragment>}
            </Portal>

        </React.Fragment>
    }
}