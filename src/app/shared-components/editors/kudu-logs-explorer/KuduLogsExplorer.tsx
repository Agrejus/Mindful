/// <reference path="../Editors.d.ts"/>
import './KuduLogsExplorer.scss';
import * as React from 'react';
import { IEditor } from '../Editors';
import { PageType } from '../../../constants/Constants';
import * as moment from 'moment';
import { ViewTextModal } from './sub-components/ViewTextModal';

interface State {
    searchText: string;
    searchDate: string;
    files: ILogFile[];
    searchFile: string;
    file: ILogFile | null;
    fileText:string;
}

interface IKuduLogsExplorer {
    url: string;
    username: string;
    password: string;
}

export interface ILogFile {
    crtime: string;
    href: string;
    mime: string;
    mtime: string;
    name: string;
    path: string;
    size: number;
}

class KuduLogsExplorer extends React.PureComponent<EditorProps, State> {

    state: State = {
        searchText: "",
        files: [],
        searchFile: "",
        searchDate: "",
        file: null,
        fileText: ""
    }

    onPropsChange = (e: React.ChangeEvent<HTMLInputElement>, prop: keyof IKuduLogsExplorer) => {
        const explorer = this.props.content as IKuduLogsExplorer;

        this.props.onChange({ ...explorer, [prop]: e.target.value });
    }

    getLogs = async () => {
        const explorer = this.props.content as IKuduLogsExplorer;
        const response = await fetch(explorer.url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Basic ' + Buffer.from(`${explorer.username}:${explorer.password}`).toString('base64')
            }
        });
        return await response.json() as ILogFile[];
    }

    getLogContent = async (file: ILogFile) => {
        const explorer = this.props.content as IKuduLogsExplorer;
        const response = await fetch(file.href, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Basic ' + Buffer.from(`${explorer.username}:${explorer.password}`).toString('base64')
            }
        });
        return await response.text() as string;
    }

    onSearchClick = async () => {
        const files = await this.getLogs();

        for (let file of files) {

            if (!!this.state.searchDate) {
                const diff = moment(file.crtime).diff(this.state.searchDate);

                if (diff < 0) {
                    continue;
                }
            }

            this.setState({
                searchFile: file.name
            });

            const text = await this.getLogContent(file);
            if (text.includes(this.state.searchText)) {
                const filesArray = [...this.state.files];

                filesArray.push(file);
                this.setState({
                    files: filesArray
                });
            }
        }
    }

    onFileClick = async (file:ILogFile) => {
        // const fileText = await this.getLogContent(file)
        this.setState({ file })
    }

    render() {
        const explorer = this.props.content as IKuduLogsExplorer;

        return <div className="kudu-logs-explorer-editor">
            <div className="row">
                <div className="col-sm-12">
                    <label>Url</label>
                    <input type="text" className="form-control" value={explorer.url} onChange={e => this.onPropsChange(e, "url")} />
                </div>
                <div className="col-sm-12">
                    <label>Username</label>
                    <input type="text" className="form-control" value={explorer.username} onChange={e => this.onPropsChange(e, "username")} />
                </div>
                <div className="col-sm-12">
                    <label>Password</label>
                    <input type="password" className="form-control" value={explorer.password} onChange={e => this.onPropsChange(e, "password")} />
                </div>
                <div className="col-sm-12">
                    <label>Search Text</label>
                    <input className="form-control" value={this.state.searchText} onChange={e => this.setState({ searchText: e.target.value })} />
                </div>
                <div className="col-sm-12">
                    <label>Search Date</label>
                    <input className="form-control" value={this.state.searchDate} onChange={e => this.setState({ searchDate: e.target.value })} />
                </div>
                <div className="col-sm-12">
                    <button onClick={this.onSearchClick}>Search</button>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    <small>NOTE: Username and password are from the publish profile</small>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    <h4>Current File</h4>
                    {this.state.searchFile}
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    <h4>Results</h4>
                </div>
                <div className="col-sm-12">
                    <ul>
                        {this.state.files.map((w, i) => {
                            return <li key={i} onClick={() => this.onFileClick(w)}>{w.name}</li>
                        })}
                    </ul>
                </div>
            </div>
            {this.state.file && <ViewTextModal
                text={this.state.fileText}
                file={this.state.file}
                onClose={() => this.setState({ file: null, fileText: "" })}
            />}
        </div>
    }
}

export class KuduLogsExplorerEditorContainer implements IEditor {
    stringifySearchContent = (content: IKuduLogsExplorer) => {
        return content.url;
    };
    render = (props: EditorProps) => <KuduLogsExplorer {...props} />;

    getDefaultContent = () => ({
        url: ""
    } as IKuduLogsExplorer);

    parse = (page: IPage) => {
        return JSON.parse(page.content);
    }

    stringify = (page: IPageModifyRequest) => {
        return JSON.stringify(page.content);
    }

    type = PageType.KuduLogsExplorer;
    icon = "bi bi-file-ruled";
    displayName = "Kudu Logs Explorer";
}