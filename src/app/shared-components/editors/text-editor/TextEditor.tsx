/// <reference path="../Editors.d.ts"/>
import './TextEditor.scss';
import * as React from 'react';
import { IEditor } from '../Editors';
import { PageType } from '../../../constants/Constants';

interface State {

}

class TextEditor extends React.PureComponent<EditorProps, State> {

    render() {
        return <div className="text-editor">
            <textarea value={this.props.content} onChange={e => this.props.onChange(e.target.value)} />
        </div>
    }
}

export class TextEditorContainer implements IEditor {
    stringifySearchContent = (content: string) => content;
    render = (props: EditorProps) => <TextEditor {...props} />;

    getDefaultContent = () => "";

    parse = (page: IPage) => {
        return page.content;
    }

    stringify = (page: IPageModifyRequest) => {
        return page.content;
    }

    type = PageType.PlainText;
    icon = "bi bi-file-text";
    displayName = "Plain Text";
}