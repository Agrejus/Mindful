/// <reference path="../Editors.d.ts"/>
import * as React from 'react';
import './NotepadEditor.scss';
import { TabStrip, TabStripSelectEventArguments, TabStripTab } from '@progress/kendo-react-layout';
import { convertFromRaw, convertToRaw, Editor, EditorState, Modifier, RichUtils } from 'draft-js';
import { ContextMenu, ContextMenuItem, IContextMenu } from '../../context-menu/ContextMenu';
import { SortableOnDragOverEvent, SortableOnNavigateEvent } from '@progress/kendo-react-sortable';
import { ButtonType, Modal } from '../../modal/Modal';
import { IEditor } from '../Editors';
import { PageType } from '../../../constants/Constants';

interface State {
    content: any;
    deleteNote: INote | null;
}

interface INote {
    isSelected: boolean;
    order: number;
    content: any;
    title: string;
    id: number;
    isRenaming?: boolean;
}

class NotepadEditor extends React.Component<EditorProps, State> {

    contextMenus: IContextMenu[] = [];
    editors: { [key: string]: Editor | null } = {};
    state: State = {
        content: EditorState.createEmpty(),
        deleteNote: null
    }

    componentDidMount() {
        document.addEventListener("click", e => {

            const target = e.target as any;

            if (target instanceof HTMLAnchorElement && (target as HTMLAnchorElement).classList.contains("context-menu-item") === false) {
                this.hideAllVisibleMenus();
            }

            this.hideAllVisibleMenus();
        });
    }

    onSelect = (e: TabStripSelectEventArguments) => {
        const notes = this.props.content as INote[];
        const alteredNotes = notes.map((w, i) => {
            return { ...w, isSelected: i === e.selected }
        });
        this.props.onChange(alteredNotes);
    }

    focusEditor = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {

        if (e.target instanceof HTMLImageElement) {

        }

        if (this.editors[index]) {
            this.editors[index]!.focus();
        }
    }


    onTab = (e: React.KeyboardEvent<{}>, index: number) => {
        e.preventDefault();
        const notes = this.props.content as INote[];

        if (e.shiftKey) {
            // figure out how to get this to work
            const currentState = notes[index].content;
            this.onChange(RichUtils.onTab(e, currentState, 4), index);
        } else {
            const currentState = notes[index].content;
            const newContentState = Modifier.replaceText(
                currentState.getCurrentContent(),
                currentState.getSelection(),
                "    "
            );

            const newState = EditorState.push(currentState, newContentState, 'insert-characters');
            this.onChange(newState, index);
        }
    }

    onChange = (e: EditorState, index: number) => {
        const notes = this.props.content as INote[];
        notes[index].content = e;
        this.props.onChange(notes);
    }

    onTitleChange = (title: string, index: number) => {
        const notes = this.props.content as INote[];
        notes[index].title = title;
        this.props.onChange(notes);
    }

    addNote = () => {
        const notes = this.props.content as INote[];
        const alteredNotes = notes.map((w, i) => {
            return { ...w, isSelected: false }
        });
        alteredNotes.push({
            content: EditorState.createEmpty(),
            isSelected: true,
            order: 1,
            title: `new ${alteredNotes.length + 1}`,
            id: notes.length + 1
        });
        this.props.onChange(alteredNotes);
    }

    onRenameClick = (index: number) => {
        const notes = this.props.content as INote[];
        notes[index].isRenaming = true;
        this.props.onChange(notes);
    }

    buildContextMenuItems = (data: INote, index: number): ContextMenuItem<INote>[] => {
        return [
            { text: "Rename", onClick: () => this.onRenameClick(index), data, icon: "fas fa-i-cursor" }
        ]
    }

    onShowContextMenu = () => {

    }

    hideAllVisibleMenus = () => {
        const visibleMenus = this.contextMenus.filter(w => w.visible() === true);
        for (let contextMenu of visibleMenus) {
            contextMenu.hide();
        }
    }

    onDragAction = (e: SortableOnDragOverEvent | SortableOnNavigateEvent) => {
        // debugger;
    }

    onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {

        if (e.which === 13) {
            e.preventDefault();
            const notes = this.props.content as INote[];
            const alteredNotes = notes.map(w => { return { ...w, isRenaming: false } })
            this.props.onChange(alteredNotes);
            return;
        }
    }

    handleDeleteNote = (button: ButtonType) => {

        if (button != "Yes" || this.state.deleteNote == null) {
            this.setState({
                deleteNote: null
            });
            return;
        }
        const notes = this.props.content as INote[];
        const index = notes.findIndex(w => w.id === this.state.deleteNote!.id);

        if (index === -1) {
            this.setState({
                deleteNote: null
            });
            return;
        }

        notes.splice(index, 1);

        this.props.onChange(notes);

        this.setState({
            deleteNote: null
        });
    }

    render() {
        const notes = this.props.content as INote[];
        const selected = notes.findIndex(w => w.isSelected === true);

        return <div className="notepad-editor">
            <div className="editor-toolbar">
                <div className="editor-toolbar-row">
                    <div className="editor-toolbar-button-group">
                        <button onClick={this.addNote}>
                            <i className="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
            {/* Sortable Tabs   https://github.com/ZaninAndrea/react-draggable-tabs#readme */}
            <TabStrip selected={selected} onSelect={this.onSelect}>
                {

                    notes.map((w, i) => <TabStripTab key={i} title={<ContextMenu<INote>
                        onShow={this.onShowContextMenu}
                        ref={e => { if (e) { this.contextMenus.push(e); } }}
                        contextMenuItems={this.buildContextMenuItems(w, i)}
                    >
                        {w.isRenaming === true ? <input value={w.title} onKeyDown={this.onKeyDown} onChange={e => this.onTitleChange(e.target.value, i)} /> : <span>{w.title}&emsp;<i className="bi bi-x-square text-danger" onClick={() => this.setState({ deleteNote: w })}></i></span>}
                    </ContextMenu>}>
                        <div className="rich-text-content" onClick={e => this.focusEditor(e, i)}>
                            <Editor
                                placeholder="Your notes here..."
                                ref={e => {
                                    this.editors[i] = e;
                                }}
                                editorState={w.content}
                                onChange={e => this.onChange(e, i)}
                                onTab={e => this.onTab(e, i)}
                            />
                        </div>
                    </TabStripTab>)
                }
            </TabStrip>
            {this.state.deleteNote && <Modal<INote, any>
                buttons={["Yes", "Cancel"]}
                onClick={this.handleDeleteNote}
                title="Delete Tab?"
            >
                <p>Are you sure you wish to delete {this.state.deleteNote.title}?</p>
            </Modal>}
        </div>
    }
}

export class NotepadContainer implements IEditor {

    stringifySearchContent = (content: any) => "";

    render = (props: EditorProps) => <NotepadEditor {...props} />;

    getDefaultContent = () => [];

    parse = (page: IPage) => {
        const notes = JSON.parse(page.content) as any[];
        for (let note of notes) {
            if (!note.content) {
                note.content = EditorState.createEmpty();
            } else {
                try {
                    note.content = EditorState.createWithContent(convertFromRaw(note.content))
                } catch {
                    note.content = EditorState.createEmpty();
                }
            }
        }
        return notes;
    }

    stringify = (page: IPageModifyRequest) => {
        const notes = page.content as any[];
        const stringifiedContentNotes = notes.map(w => {
            return {
                ...w,
                content: convertToRaw(w.content.getCurrentContent())
            }
        })

        return JSON.stringify(stringifiedContentNotes);
    }

    type = PageType.Notepad;
    icon = "far fa-sticky-note";
    displayName = "Notepad";
}