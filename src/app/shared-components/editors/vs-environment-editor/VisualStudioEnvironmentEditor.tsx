/// <reference path="../Editors.d.ts"/>
/// <reference path="../../../data/page-repository.d.ts"/>
import * as React from 'react';
import './VisualStudioEnvironmentEditor.scss';
import { IEditor } from '../Editors';
import { PageType } from '../../../constants/Constants';
import { fileDialog } from '../../../../external-modules/FileDialog';
import { services } from '../../../services/services';
import { ButtonType, Modal } from '../../modal/Modal';
import { DropdownButton } from '../../buttons/drop-down-button/DropdownButton';
import { getNextId, getPathWithoutFileName } from '../../../helpers/helpers';
import { IconDropdownButton } from '../../buttons/IconDropdownButton';
import { publishNotification } from '../../../services/notification-service';
import { IconButton } from '../../buttons/IconButton';
import { NugetActionsModal } from './sub-components/NugetActionsModal';

// Link to folder
// nuget operations
// pack,publish,create
//     View nuspec file
// Open project
//     Choose which vs version
// Auto detect proj files
// Add
// Tabs
// Solutions

// tabs
// Solution
// List csproj files under it?


// Solutions List
//  Type: VS or VS Code
// When clicked, show tabs of Nuget, Environment
// Environment
//  Path
//  Button to open solution

export interface IProject {
    id: number;
    environmentId: number;
    nuget: INuget | null;
    name: string;
    path: string;
    parent: string;
    fullPath: string;
    fullPathAndFileName: string;
}

interface IVisualStudioContainer {
    environments: IEnvironment[];
}

interface IEnvironment {
    id: number;
    path: string;
    name: string;
    solution: string;
    projects: IProject[];
}

interface INuget {
    nuspecFileNameAndPath: string | null;
    // commands?
}

interface State {
    deleteEnvironment: IEnvironment | null;
    projectNugetActions: IProject | null;
    isProjectNugetButtonToggled: boolean;
    isVisualStudioDropDownButtonToggled: boolean;
}

class Editor extends React.Component<EditorProps, State> {

    state: State = {
        deleteEnvironment: null,
        projectNugetActions: null,
        isProjectNugetButtonToggled: false,
        isVisualStudioDropDownButtonToggled: false
    }

    componentDidMount() {
        this.props.registerDomClickActions([{
            canIgnore: e => (e.target as HTMLElement).classList.contains("dropdown-toggle") || (e.target as HTMLElement).classList.contains("ico-visual-studio-color"),
            action: () => this.setState({ isProjectNugetButtonToggled: false, isVisualStudioDropDownButtonToggled: false })
        }]);
    }

    selectFileClick = async () => {
        const files = await fileDialog({ accept: ".sln" });

        if (files.length === 0) {
            return;
        }

        const container = this.props.content as IVisualStudioContainer;
        const name = files[0].name;
        const path = (files[0] as any).path as string;

        const solution = services.fileService.readFileContents(path);
        const matches = solution.match(/\"(.*?)\"/g);
        const projFiles: string[] = (matches ?? []).map(w => w.substring(1, w.length - 1)).filter(w => w.endsWith("csproj")).map(w => w);
        const environmentId = getNextId(container.environments, w => w.id);
        const parent = getPathWithoutFileName(path);
        container.environments.push({
            id: environmentId,
            name,
            solution: name,
            path,
            projects: projFiles.map((w, i) => {
                return {
                    id: i + 1,
                    path: w,
                    nuget: null,
                    name: w.replace(/^.*[\\\/]/, ''),
                    parent,
                    environmentId,
                    fullPathAndFileName: `${parent}\\${w}`,
                    fullPath: getPathWithoutFileName(`${parent}\\${w}`)
                }
            })
        });

        this.props.onChange(container);
    }

    handleDelete = (button: ButtonType) => {

        if (button !== "Yes") {
            this.setState({
                deleteEnvironment: null
            });
            return
        }

        const container = this.props.content as IVisualStudioContainer;
        const index = container.environments.findIndex(w => w.id == this.state.deleteEnvironment?.id);

        if (index == -1) {
            this.setState({
                deleteEnvironment: null
            });
            return;
        }

        container.environments.splice(index, 1);

        this.props.onChange(container);

        this.setState({
            deleteEnvironment: null
        });
    }

    onProjectChange = async (project: IProject) => {
        const container = this.props.content as IVisualStudioContainer;
        const environmentIndex = container.environments.findIndex(w => w.id == project.environmentId);

        if (environmentIndex == -1) {
            return;
        }

        const projectIndex = container.environments[environmentIndex].projects.findIndex(w => w.id == project.id);

        if (projectIndex == -1) {
            return;
        }

        container.environments[environmentIndex].projects[projectIndex] = { ...project };

        this.props.onChange(container);
    }

    render() {
        const container = this.props.content as IVisualStudioContainer;

        return <div className="text-editor vs-editor">
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
                <h4>Solutions <small>({container.environments?.length})</small></h4>
                {
                    container.environments.map((w, i) => <div key={`div-${i}`} className="card">
                        <div className="card-header">
                            {w.name}
                            <div className="card-header-actions">
                                <IconButton className="text-default" title="open folder" iconClassName="far fa-folder-open" onClick={() => services.fileService.openFilePath(getPathWithoutFileName(w.path))} />
                                <IconButton title="Open in VS Code" iconClassName="ico ico-sm ico-visual-studio-code" onClick={() => services.visualStudioService.openVisualStudioCode(getPathWithoutFileName(w.path))} />
                                <IconDropdownButton title="Open Solution" onToggle={e => this.setState({ isVisualStudioDropDownButtonToggled: e })} isToggled={this.state.isVisualStudioDropDownButtonToggled} className="text-default" iconClassName="ico ico-sm ico-visual-studio-color">
                                    <a className="dropdown-item clickable" onClick={() => services.fileService.openFile(w.path)}>Open</a>
                                    <a className="dropdown-item clickable" onClick={() => services.visualStudioService.openVisualStudioFileAsAdmin(w.path)}>Open as Admin</a>
                                </IconDropdownButton>
                                <IconButton className="text-default" title="edit" iconClassName="far fa-edit" />
                                <IconButton className="text-default" onClick={() => this.setState({ deleteEnvironment: w })} title="delete" iconClassName="fas fa-trash-alt" />
                            </div>
                        </div>
                        <div className="card-body">
                            <label>Projects</label>
                            {
                                w.projects.map((x, j) => <div className="project-container" key={`env-${j}`}>
                                    {x.name}
                                    <div className="actions-container">
                                        <IconButton title="Open in VS Code" iconClassName="ico ico-sm ico-visual-studio-code" onClick={() => services.visualStudioService.openVisualStudioCode(x.fullPath)} />
                                        <IconButton className="text-default" title="nuget actions" iconClassName="ico ico-sm ico-nuget" onClick={() => this.setState({ projectNugetActions: x })} />
                                    </div>
                                </div>)
                            }
                        </div>
                    </div>)
                }
            </div>
            {this.state.deleteEnvironment != null && <Modal
                buttons={["Yes", "Cancel"]}
                onClick={this.handleDelete}
                title="Delete Solution?"
            >
                <p>Are you sure you want to delete {this.state.deleteEnvironment?.name}?</p>
            </Modal>}
            {this.state.projectNugetActions != null && <NugetActionsModal
                isDropdownToggled={this.state.isProjectNugetButtonToggled}
                onChange={this.onProjectChange}
                onClick={() => this.setState({ projectNugetActions: null })}
                onDropdownToggle={e => this.setState({ isProjectNugetButtonToggled: e })}
                onError={e => publishNotification({ message: e })}
                onSuccess={e => publishNotification({ message: e })}
                project={this.state.projectNugetActions}
                title={`${this.state.projectNugetActions.name} Nuget Actions`}
            />}
        </div>
    }
}

export class VisualStudioEnvironmentEditor implements IEditor {
    stringifySearchContent = (content: any) => "";
    render = (props: EditorProps) => <Editor {...props} />;

    getDefaultContent = () => { return { environments: [] } as IVisualStudioContainer; };

    parse = (page: IPage) => {
        return JSON.parse(page.content);
    }

    stringify = (page: IPageModifyRequest) => {
        return JSON.stringify(page.content);
    }

    type = PageType.VisualStudio;
    icon = "ico ico-visual-studio ico-sm";
    displayName = "Visual Studio";
}