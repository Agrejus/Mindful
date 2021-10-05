/// <reference path="../Editors.d.ts"/>
/// <reference path="../../../data/page-repository.d.ts"/>
import * as React from 'react';
import './AppsEditor.scss';
import { IEditor } from '../Editors';
import { PageType } from '../../../constants/Constants';
import { fileDialog } from '../../../../external-modules/FileDialog';
import { getFileNameWithoutExtension, getNextId } from '../../../helpers/helpers';
import { getIcon } from '../../../../external-modules/icon-extractor';
import { services } from '../../../services/services';
import { ButtonType, Modal } from '../../modal/Modal';

interface IApp {
    id: number;
    path: string;
    icon: string;
    name: string;
}

interface IContainer {
    apps: IApp[];
}

interface State {
    filterText: string;
    renameApp: IApp | null;
    deleteApp: IApp | null;
    visibleDropDownId:number;
}

class Editor extends React.PureComponent<EditorProps, State> {

    state: State = {
        filterText: "",
        renameApp: null,
        deleteApp: null,
        visibleDropDownId: -1
    }

    componentDidMount() {
        this.props.registerDomClickActions([{
            canIgnore: e => (e.target as HTMLElement).classList.contains("dropdown-toggle") || (e.target as HTMLElement).classList.contains("sr-only"),
            action: () => this.setState({ visibleDropDownId: -1 })
        }]);
    }

    selectFileClick = async () => {
        const files = await fileDialog({ accept: ".exe" });

        if (files.length === 0) {
            return;
        }

        const container = this.props.content as IContainer;
        const name = getFileNameWithoutExtension(files[0].name);
        const path = (files[0] as any).path as string;
        const icon = await getIcon(path);
        const id = getNextId(container.apps, w => w.id);

        container.apps.push({
            path,
            icon,
            name,
            id
        });

        this.props.onChange(container);
    }

    onDeleteClick = (index: number) => {
        const container = this.props.content as IContainer;

        container.apps.splice(index, 1);

        this.props.onChange(container);
    }

    handleAppRename = (name: string, id: number) => {
        const container = this.props.content as IContainer;
        const index = container.apps.findIndex(w => w.id == id);

        if (index === -1) {
            return;
        }

        container.apps[index].name = name;

        this.setState({ renameApp: null });
        this.props.onChange(container);
    }

    toggleDropdown = (app:IApp) => {

        if (this.state.visibleDropDownId === app.id) {
            this.setState({
                visibleDropDownId: -1
            });
            return;
        }

        this.setState({
            visibleDropDownId: app.id
        });
    }

    render() {
        const container = this.props.content as IContainer;

        return <div className="text-editor apps-editor">
            <div className="editor-toolbar">
                <div className="editor-toolbar-row">
                    <div className="editor-toolbar-button-group">
                        <button>
                            <i className="fas fa-plus clickable" onClick={this.selectFileClick}></i>
                        </button>
                    </div>
                </div>
            </div>
            <div>
                <div className="apps-list-filter-container">
                    <div>
                        <input className="form-control" placeholder="search..." value={this.state.filterText} onChange={e => this.setState({ filterText: e.target.value })} />
                    </div>
                    <div>
                        <h4>Apps <small>({container.apps.length})</small></h4>
                        <div>
                            {
                                container.apps.filter(w => {
                                    if (!this.state.filterText) {
                                        return true;
                                    }

                                    return w.name.toLowerCase().includes(this.state.filterText.toLowerCase());
                                }).map((w, i) => <div key={`app-${i}`} className="text-center app">
                                    <img className="clickable" onClick={() => services.fileService.openFile(w.path)} src={`data:image/jpeg;base64,${w.icon}`} />
                                    <div className="app-name"><span>{w.name}</span>&nbsp;<i className="bi bi-pencil-square clickable" onClick={() => this.setState({ renameApp: w })}></i></div>
                                    <i onClick={() => this.onDeleteClick(i)} className="bi bi-x clickable app-close"></i>
                                    <div className="app-actions">
                                        <div className="btn-group">
                                            <button type="button" className="btn btn-primary btn-xs" onClick={() => services.fileService.openFile(w.path)}>Launch</button>
                                            <button className="btn btn-primary dropdown-toggle dropdown-toggle-split btn-xs" onClick={() => this.toggleDropdown(w)}>
                                                <span className="sr-only">Toggle Dropdown</span>
                                            </button>
                                            <div className={`dropdown-menu ${this.state.visibleDropDownId === w.id ? "show" : ""}`}>
                                                <a className="dropdown-item clickable" onClick={() => services.fileService.openFileAsAdmin(w.path)}>Launch as Admin</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>)
                            }
                        </div>
                    </div>
                </div>
            </div>
            {this.state.renameApp != null && <RenameModal
                onRename={this.handleAppRename}
                app={this.state.renameApp}
                onClose={() => this.setState({ renameApp: null })}
            />}
        </div>
    }
}

interface RenameModalProps {
    onRename: (name: string, id: number) => void;
    app: IApp;
    onClose: () => void;
}

interface RenameModalState {
    name: string;
}

class RenameModal extends React.PureComponent<RenameModalProps, RenameModalState> {

    state: RenameModalState = {
        name: this.props.app.name
    };

    onClick = (button: ButtonType) => {
        if (button !== "Ok") {
            this.props.onClose();
            return;
        }

        this.props.onRename(this.state.name, this.props.app.id);
    }

    render() {
        return <Modal
            buttons={["Ok", "Cancel"]}
            onClick={this.onClick}
            title="Rename App">
            <div>Name:</div>
            <input className="form-control" type="text" value={this.state.name} onChange={e => this.setState({ name: e.target.value })} />
        </Modal>
    }
}

export class AppsEditorContainer implements IEditor {
    stringifySearchContent = (content: any) => "";
    render = (props: EditorProps) => <Editor {...props} />;

    getDefaultContent = () => { return { apps: [] } as IContainer; };

    parse = (page: IPage) => {
        return JSON.parse(page.content);
    }

    stringify = (page: IPageModifyRequest) => {
        return JSON.stringify(page.content);
    }

    type = PageType.Apps;
    icon = "bi bi-collection";
    displayName = "Apps";
}