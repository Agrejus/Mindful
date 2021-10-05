/// <reference path="../Editors.d.ts"/>
import * as React from 'react';
import { ButtonType, Modal } from '../../modal/Modal';
import { services } from '../../../services/services';
import './LinksEditor.scss';
import { IEditor } from '../Editors';
import { PageType } from '../../../constants/Constants';
import { MultiSelect, MultiSelectChangeEvent } from '@progress/kendo-react-dropdowns';
import { uniq } from 'lodash';
import { publishNotification } from '../../../services/notification-service';
import { HoverExpandButton } from '../../buttons/HoverExpandButton';

interface State {
    isAddLinkModalVisible: boolean;
    filterText: string;
    deleteLinkIndex: number | null;
    editLinkIndex: number | null;
    tagFilter: string;
}

export interface ILink {
    link: string;
    name: string;
    tags: string[]
}

class LinksEditor extends React.PureComponent<EditorProps, State> {

    state: State = {
        isAddLinkModalVisible: false,
        filterText: "",
        deleteLinkIndex: null,
        editLinkIndex: null,
        tagFilter: ""
    }

    onAddEditLink = (link: ILink) => {
        const links = this.props.content as ILink[];

        if (this.state.editLinkIndex == null) {
            links.push(link);
        } else {
            links[this.state.editLinkIndex] = link;
        }

        this.props.onChange(links);
        this.setState({ editLinkIndex: null, isAddLinkModalVisible: false });
    }

    onLinkClick = async (link: string) => {
        services.fileService.openFile(link);
    }

    handleLinkDelete = (button: ButtonType) => {
        if (button === "Yes" && this.state.deleteLinkIndex != null) {
            const links = this.props.content as ILink[];
            links.splice(this.state.deleteLinkIndex, 1);
            this.props.onChange(links);
        }
        this.setState({ deleteLinkIndex: null });
    }

    filterLinks = (link: ILink) => {
        const lower = this.state.filterText.toLowerCase();

        if (!this.state.filterText && !this.state.tagFilter) {
            return true;
        }

        if (this.state.filterText && !this.state.tagFilter) {
            return link.link.toLowerCase().includes(lower) || link.name.toLowerCase().includes(lower) || link.tags?.some(x => x.toLowerCase().includes(lower));
        }

        if (!this.state.filterText && this.state.tagFilter) {
            return link.tags?.some(w => w === this.state.tagFilter);
        }

        return (link.link.toLowerCase().includes(lower) || link.name.toLowerCase().includes(lower) || link.tags?.some(x => x.toLowerCase().includes(lower))) && (link.tags?.some(w => w === this.state.tagFilter));
    }

    onCopyClick = (link: ILink) => {
        const tempInput = document.createElement("input");
        tempInput.value = link.link;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);

        publishNotification({ message: "Copied to clipboard" })
    }

    render() {
        const links = (this.props.content || []) as ILink[];
        const filteredLinks = links.filter(this.filterLinks);
        let tags: string[] = [];
        const reduce = links.filter(w => w.tags && w.tags.length > 0).map(w => w.tags);

        if (reduce.length > 0) {
            tags = uniq(reduce.reduce((a, b) => a.concat(b)));
        }

        return <div className="links-container">
            <div className="editor-toolbar">
                <div className="editor-toolbar-row">
                    <div className="editor-toolbar-button-group">
                        <button onClick={() => this.setState({ isAddLinkModalVisible: true })}>
                            <i className="fas fa-plus"></i>
                        </button>
                    </div>

                </div>
            </div>
            <div className="link-list">
                <div className="link-list-filter-container">
                    <div>
                        <input className="form-control" placeholder="search..." value={this.state.filterText} onChange={e => this.setState({ filterText: e.target.value })} />
                    </div>
                    <div className="text-center link-tag-filter-container">
                        <span className="link-tag" onClick={() => this.setState({ tagFilter: "" })}>All</span>
                        {
                            tags?.map((w, i) => {

                                const isActive = w === this.state.tagFilter;
                                return <span key={`${w}-${i}-main`} className={`link-tag${isActive ? " link-tag-active" : ""}`} onClick={() => this.setState({ tagFilter: w })}>{w}{isActive && <React.Fragment>&emsp;<i className="fas fa-filter"></i></React.Fragment>}</span>
                            })
                        }
                    </div>
                </div>
                <div>
                    <h4>Links <small>({links.length})</small></h4>
                    {
                        filteredLinks.map((w, i) => <div key={`app-${i}`} className="text-center card">
                            <div className="card-name">
                                <span className="clickable" onClick={() => this.onLinkClick(w.link)}>{w.name}</span>&nbsp;<i className="bi bi-pencil-square clickable" onClick={() => this.setState({ editLinkIndex: i })}></i><i className="bi bi-files clickable" onClick={() => this.onCopyClick(w)}></i>
                                <a title={w.link} className="clickable link" onClick={() => this.onLinkClick(w.link)}>{w.link}</a>
                            </div>
                            <i className="bi bi-x clickable card-close" onClick={() => this.setState({ deleteLinkIndex: i })}></i>
                            <div className="card-actions">
                                <div className="btn-group">
                                    {
                                        w.tags?.map((x, j) => <span key={`${w}-${j}`} className="link-tag">{x}</span>)
                                    }
                                </div>
                            </div>
                        </div>)
                    }
                </div>
            </div>
            {this.state.isAddLinkModalVisible && <AddEditLinkModal
                tags={tags}
                onClose={() => this.setState({ isAddLinkModalVisible: false })}
                onSuccess={this.onAddEditLink}
            />}
            {this.state.deleteLinkIndex != null && <Modal
                buttons={["Yes", "Cancel"]}
                onClick={this.handleLinkDelete}
                title="Delete Link?"
            >
                <p>Are you sure?</p>
            </Modal>}
            {this.state.editLinkIndex != null && <AddEditLinkModal
                tags={tags}
                onClose={() => this.setState({ editLinkIndex: null })}
                onSuccess={this.onAddEditLink}
                link={links[this.state.editLinkIndex]}
            />}
        </div>
    }
}

interface AddLinkModalProps {
    onClose: () => void;
    onSuccess: (link: ILink) => void;
    tags: string[];
    link?: ILink;
}

interface AddLinkModalState {
    link: string;
    name: string;
    tags: string[];
}

class AddEditLinkModal extends React.PureComponent<AddLinkModalProps, AddLinkModalState> {

    state: AddLinkModalState = {
        name: this.props.link?.name ?? "",
        link: this.props.link?.link ?? "",
        tags: this.props.link?.tags ?? []
    }

    onClick = (button: ButtonType) => {
        if (button === "Cancel") {
            this.props.onClose();
            return;
        }

        this.props.onSuccess({
            name: this.state.name,
            link: this.state.link,
            tags: this.state.tags
        });
    }

    onTagsChange = (e: MultiSelectChangeEvent) => {
        const tags = [...e.target.value] as string[];
        this.setState({ tags })
    }

    render() {
        return <Modal<ILink, string[]>
            buttons={["Ok", "Cancel"]}
            onClick={this.onClick}
            title=""
            extraData={this.props.tags}>
            <div className="row">
                <div className="col-sm-12">
                    <label>Name</label>
                    <input type="text" className="form-control" value={this.state.name} onChange={e => this.setState({ name: e.target.value })} />
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    <label>URL</label>
                    <input type="text" className="form-control" value={this.state.link} onChange={e => this.setState({ link: e.target.value })} />
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    <label>Tags</label>
                    <MultiSelect
                        data={this.props.tags}
                        onChange={this.onTagsChange}
                        value={this.state.tags}
                        allowCustom={true}
                    />
                </div>
            </div>
        </Modal>
    }
}

export class LinksContainer implements IEditor {

    stringifySearchContent = (content: ILink[]) => {
        const links = content as ILink[];

        return links.map(w => `${w.name} ${w.link}`).join(" ");
    };

    render = (props: EditorProps) => <LinksEditor {...props} />;

    getDefaultContent = () => [];

    parse = (page: IPage) => {
        return JSON.parse(page.content);
    }

    stringify = (page: IPageModifyRequest) => {
        return JSON.stringify(page.content);
    }

    type = PageType.Links;
    icon = "far fa-hand-pointer";
    displayName = "Links";
}