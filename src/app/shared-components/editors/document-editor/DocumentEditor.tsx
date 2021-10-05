/// <reference path="../../../data/interactivity-repository.d.ts"/>
import * as React from 'react';
import './DocumentEditor.scss';
import { services } from '../../../services/services';
import { PageType } from '../../../constants/Constants';
import { IEditor } from '../Editors';
import { merge, sortBy } from 'lodash';

interface State {

}

interface IDocumentContent {
    paths: IPathInfo[];
    showOnlyTracked: boolean;
    showAllInFolderPaths: string[];
}

class DocumentEditor extends React.PureComponent<EditorProps, State> {

    state: State = {

    }

    availableIcons: string[] = [];
    clickPath: IPathInfo[] = [];
    activeClickPathIndex: number = 0;

    //https://fileicons.org/?view=vivid
    async componentDidMount() {
        const response = await fetch("static/catalog.json");
        this.availableIcons = await response.json() as string[];
        const content = this.props.content as IDocumentContent;

        if (content.paths.length === 0) {
            // doesnt work because of setting on render, fix this
            await this.init(content);
        }
    }

    init = async (content: IDocumentContent) => {

        const drives = await services.fileService.getDrives();
        const root: IPathInfo = {
            children: [],
            fullPath: "",
            isTracked: false,
            isSelected: true,
            name: "root",
            parts: [],
            type: "directory",
            isVisible: false
        };

        root.children = drives.map(w => {
            const parts = [w.mounted];
            return {
                name: w.mounted,
                type: "directory",
                isTracked: false,
                parts,
                fullPath: this.createPath(parts),
                children: [],
                isSelected: false,
                isVisible: false
            }
        });

        this.save({ ...content, paths: [root] })
    }

    createPath = (parts: string[], isFile:boolean = false) => {

        if (parts.length === 0) {
            return "";
        }

        const result = parts.join("\\");
        if (isFile) {
            return result;
        }
        return `${result}\\`;
    }

    onClick = async (path: IPathInfo) => {

        const content = this.props.content as IDocumentContent;

        if (path.type === "file") {
            services.fileService.openFile(path.fullPath)
            return;
        }

        const directories = services.fileService.getFilesAndFolders(path.fullPath);

        const children = sortBy(directories.map(w => {
            const parts = path.parts.concat([w.name]);
            return {
                children: [],
                name: w.name,
                parts,
                type: w.type,
                isTracked: false,
                isSelected: false,
                fullPath: this.createPath(parts, w.type === "file"),
                isVisible: false
            } as IPathInfo
        }), w => w.type);

        if (path.children) {
            path.children = merge(children, path.children)
        }

        this.each(content, w => {
            w.isSelected = false;
        })

        path.isSelected = true;

        this.clickPath.push(path)
        this.activeClickPathIndex = this.clickPath.length - 1;

        this.save(content)
    }

    save = (content: IDocumentContent) => {
        // console.log('save', content)
        this.props.onChange(content);
    }

    getIcon = (path: IPathInfo) => {
        if (path.type === "directory") {
            return <i className="fiv-viv fiv-icon-folder fiv-size-md"></i>
        }

        const className = this.getIconClassName(path.name);
        return <i className={className}></i>
    }

    getIconClassName = (fileName: string) => {
        const extension = this.getFileExtension(fileName);

        if (this.availableIcons.includes(extension) === false) {
            return `fiv-viv fiv-icon-blank fiv-size-md`;
        }

        return `fiv-viv fiv-icon-${extension} fiv-size-md`;
    }

    getFileExtension = (name: string) => {
        const index = name.lastIndexOf(".");

        if (index === -1) {
            return name;
        }

        return name.substring(index + 1, name.length);
    }

    onBackClick = () => {

        if (this.activeClickPathIndex <= 0) {
            return
        }

        this.activeClickPathIndex--;
        const path = this.clickPath[this.activeClickPathIndex]

        this.setState({
            activePath: path
        });
    }

    onForwardClick = () => {

        if (this.activeClickPathIndex >= (this.clickPath.length - 1)) {
            return
        }

        this.activeClickPathIndex++;
        const path = this.clickPath[this.activeClickPathIndex]

        this.setState({
            activePath: path
        });
    }

    getAllChildren = (path: IPathInfo) => {
        let result = [...path.children];

        for (let i = 0; i < result.length; i++) {
            const item = result[i];

            if (item.children) {
                result = result.concat(item.children);
            }
        }

        return result;
    }

    any = (content: IDocumentContent, fn: (path: IPathInfo) => boolean) => {
        return this.firstOrDefault(content, fn) != null;
    }

    where = (content: IDocumentContent, fn: (path: IPathInfo) => boolean) => {
        let search = [...content.paths];
        let result: IPathInfo[] = [];

        for (let i = 0; i < search.length; i++) {
            const item = search[i];

            if (fn(item) === true) {
                result.push(item);
            }

            if (item.children) {
                search = search.concat(item.children);
            }
        }

        return result
    }

    each = (content: IDocumentContent, fn: (path: IPathInfo) => void) => {
        let search = [...content.paths]

        for (let i = 0; i < search.length; i++) {
            const item = search[i];

            fn(item);

            if (item.children) {
                search = search.concat(item.children);
            }
        }
    }

    getLinkedPath = (content: IDocumentContent, path: IPathInfo) => {
        const parts: string[] = [];
        const result: IPathInfo[] = [];

        for (let i = 0; i < path.parts.length; i++) {
            parts.push(path.parts[i]);
            const fullPath = this.createPath(parts);
            const found = this.firstOrDefault(content, w => w.fullPath === fullPath);

            if (!found) {
                continue;
            }

            result.push(found);
        }

        return result;
    }

    firstOrDefault = (content: IDocumentContent, fn: (path: IPathInfo) => boolean) => {
        let search = [...content.paths]

        for (let i = 0; i < search.length; i++) {
            const item = search[i];

            if (fn(item) === true) {
                return item;
            }

            if (item.children) {
                search = search.concat(item.children);
            }
        }

        return null
    }

    onAddressBarPartClick = (fullPath: string) => {

        const content = this.props.content as IDocumentContent;
        const path = this.firstOrDefault(content, w => w.fullPath === fullPath);

        if (!path) {
            return;
        }

        this.each(content, w => {
            w.isSelected = false;
        });

        path.isSelected = true;

        this.save(content);
    }

    renderAddressBar = (activePath:IPathInfo | null) => {
        const children: React.ReactNode[] = [];

        if (activePath != null) {

            let fullPathParts: string[] = [];
            for (let i = 0; i < activePath.parts.length; i++) {
                const part = activePath.parts[i];
                const fullPath = this.createPath(fullPathParts);

                // Yes this after create path
                fullPathParts.push(part);
                children.push(<span key={`address-bar-${i}`} className="file-navigator file-navigator-path" onClick={() => this.onAddressBarPartClick(fullPath)}>{part}</span>);

                if (i < (activePath.parts.length - 1)) {
                    children.push(<span key={`address-bar-separator-${i}`} className="file-navigator file-navigator-separator">\</span>);
                }
            }
        }

        return <div className="address-bar">
            <div className="address-navigation">
                <i onClick={this.onBackClick} className="bi bi-arrow-left-square fa-2x clickable"></i>
                <i className="bi bi-arrow-right-square fa-2x clickable"></i>
                <i className="bi bi-arrow-up-square fa-2x clickable"></i>
            </div>
            <div className="address-link">
                {children}
            </div>
        </div>
    }

    onToggleTracked = (e: React.ChangeEvent<HTMLInputElement>, pathInfo: IPathInfo) => {
        const content = this.props.content as IDocumentContent;
        const paths = [...content.paths];
        const path = this.firstOrDefault(content, w => w.fullPath == pathInfo.fullPath);
        const value = e.target.checked;

        if (!path) {
            return;
        }

        path.isTracked = value;

        this.save({ ...content, paths })
    }

    onToggleShowOnlyTracked = (value: boolean) => {
        const content = this.props.content as IDocumentContent;
        content.showOnlyTracked = value;
        this.save(content);
    }

    onToggleShowAllInFolder = (activePath:IPathInfo | null) => {

        if (!activePath) {
            return;
        }

        const content = this.props.content as IDocumentContent;
        const index = content.showAllInFolderPaths.findIndex(w => w === activePath.fullPath)

        if (index !== -1) {
            content.showAllInFolderPaths.splice(index, 1);
        } else {
            content.showAllInFolderPaths.push(activePath.fullPath);
        }

        this.save(content);
    }

    render() {

        const content = this.props.content as IDocumentContent;
        const active = this.firstOrDefault(content, w => w.isSelected === true);
        const activeFullPath = active?.fullPath ?? "";

        let items = (active?.children ?? []);
        const trackedItems = this.where(content, w => w.isTracked === true);
        const trackedPaths = trackedItems.map(w => this.createPath(w.parts));

        if (content.showOnlyTracked === true && content.showAllInFolderPaths.includes(activeFullPath) === false) {
            items = items.filter(w => w.name === "root" || w.isVisible === true || w.isTracked === true || trackedPaths.some(x => x.includes(w.fullPath)));
        }

        return <div className="document-editor">
            <div className="editor-toolbar">
                <div className="editor-toolbar-row">
                    <div className="editor-toolbar-button-group">
                        {
                            content.showOnlyTracked === true ?
                                <button onClick={() => this.onToggleShowOnlyTracked(!content.showOnlyTracked)}><i className="bi bi-eye-slash"></i></button> :
                                <button onClick={() => this.onToggleShowOnlyTracked(!content.showOnlyTracked)}><i className="bi bi-eye-fill"></i></button>
                        }
                    </div>
                    <span className="separator"></span>
                    <div className="editor-toolbar-button-group">
                        {
                            content.showAllInFolderPaths.includes(activeFullPath) === true ?
                                <button className="btn-with-text" onClick={() => this.onToggleShowAllInFolder(active)}><i className="bi bi-check-square"></i>&nbsp;<span>Show All In Folder</span></button> :
                                <button className="btn-with-text" onClick={() => this.onToggleShowAllInFolder(active)}><i className="bi bi-square"></i>&nbsp;<span>Show All In Folder</span></button>
                        }
                    </div>
                </div>
            </div>
            {this.renderAddressBar(active)}
            {
                <table>
                    <thead>
                        <tr>
                            <td>Name</td>
                            <td>Tracking</td>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((w, i) => <tr className="file-navigator file-navigator-item" key={`tr-doc-${i}`}>
                            <td><div onClick={() => this.onClick(w)}>{this.getIcon(w)}&emsp;<span className="file-name">{w.name}</span></div></td>
                            <td><input type="checkbox" onChange={e => this.onToggleTracked(e, w)} checked={w.isTracked} /></td>
                        </tr>)}
                    </tbody>
                </table>
            }
        </div>
    }
}

export class DocumentContainer implements IEditor {

    stringifySearchContent = (content: any) => {
        const board = content as IDocumentContent;

        return "";
    };

    render = (props: EditorProps) => <DocumentEditor {...props} />;

    getDefaultContent = () => {
        return {
            showOnlyTracked: false,
            paths: [],
            showAllInFolderPaths: []
        } as IDocumentContent;
    };

    parse = (page: IPage) => {
        return JSON.parse(page.content);
    }

    stringify = (page: IPageModifyRequest) => {
        return JSON.stringify(page.content);
    }

    type = PageType.Document;
    icon = "fas fa-archive";
    displayName = "Documents";
}