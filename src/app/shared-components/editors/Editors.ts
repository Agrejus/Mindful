/// <reference path="../../data/page-repository.d.ts" />
import { KanbanEditorContainer } from './kanban-editor/KanbanEditor';
import { VisualStudioEnvironmentEditor } from './vs-environment-editor/VisualStudioEnvironmentEditor';
import { PageType } from '../../constants/Constants';
import { DocumentContainer } from './document-editor/DocumentEditor';
import { LinksContainer } from './links-editor/LinksEditor';
import { MarkdownContainer } from './markdown-editor/MarkdownEditor';
import { NotepadContainer } from './notepad-editor/NotepadEditor';
import { RichTextEditorContainer } from './rich-text-editor/RichTextEditor';
import { TextEditorContainer } from './text-editor/TextEditor';
import { TaskEditorContainer } from './task-editor/TaskEditor';
import { AppsEditorContainer } from './apps-editor/AppsEditor';
import { KuduLogsExplorerEditorContainer } from './kudu-logs-explorer/KuduLogsExplorer';

export interface IEditor {
    render: (props: EditorProps) => React.ReactNode;
    getDefaultContent: () => any;
    parse: (page: IPage) => any;
    stringify: (page: IPageModifyRequest) => string;
    stringifySearchContent: (content: any) => string;
    icon: string;
    type: PageType;
    displayName: string;
}

export const editors: IEditor[] = [
    new DocumentContainer(),
    new LinksContainer(),
    new MarkdownContainer(),
    new NotepadContainer(),
    new RichTextEditorContainer(),
    new TextEditorContainer(),
    new VisualStudioEnvironmentEditor(),
    new KanbanEditorContainer(),
    new TaskEditorContainer(),
    new AppsEditorContainer(),
    new KuduLogsExplorerEditorContainer()
];

export const render = (type: PageType, props: EditorProps): React.ReactNode | null => {
    try {
        const editor = editors.find(w => w.type === type);

        if (!editor) {
            return null;
        }
    
        return editor.render(props);
    } catch (ex) {
        alert(ex)
        return null;
    }
}

export const getDisplayName = (type: PageType) => {
    const editor = editors.find(w => w.type === type);

    if (!editor) {
        return "";
    }

    return editor.displayName;
}

export const getDefaultContent = (type: PageType) => {
    const editor = editors.find(w => w.type === type);

    if (!editor) {
        return null;
    }

    return editor.getDefaultContent();
}

export const getIconClass = (type: PageType) => {
    const editor = editors.find(w => w.type === type);

    if (!editor) {
        return undefined;
    }

    return editor.icon;
}

export const stringifySearchContent = (pageType: PageType, content: any) => {
    const editor = editors.find(w => w.type === pageType);

    if (!editor) {
        return null;
    }

    return editor.stringifySearchContent(content);
}

export const stringify = (page: IPage | IPageModifyRequest) => {
    const editor = editors.find(w => w.type === page.pageTypeId);

    if (!editor) {
        return null;
    }

    return editor.stringify(page);
}

export const parse = (page: IPage) => {
    const editor = editors.find(w => w.type === page.pageTypeId);

    if (!editor) {
        return null;
    }

    return editor.parse(page);
}