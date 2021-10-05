/// <reference path="../Editors.d.ts"/>
import 'draft-js-alignment-plugin/lib/plugin.css';
import * as React from 'react';
import { EditorState, RichUtils, convertFromRaw, AtomicBlockUtils, DraftHandleValue, DraftEditorCommand, Modifier, convertToRaw, SelectionState, convertFromHTML, ContentState, DraftEntityType, ContentBlock, Entity } from 'draft-js';
import Editor, { composeDecorators } from 'draft-js-plugins-editor';
import createImagePlugin from 'draft-js-image-plugin';
const createAlignmentPlugin = require('draft-js-alignment-plugin');
import createFocusPlugin from 'draft-js-focus-plugin';
import createResizeablePlugin from 'draft-js-resizeable-plugin';
import createBlockDndPlugin from 'draft-js-drag-n-drop-plugin';
const createLinkifyPlugin = require('draft-js-linkify-plugin');
const createDragNDropUploadPlugin = require('draft-js-dragndrop-upload-plugin');
import test from './plugins/Test';
import htmlToDraft from 'html-to-draftjs';
import "draft-js/dist/Draft.css";
import 'draft-js-linkify-plugin/lib/plugin.css';
import './RichTextEditor.scss';
import { IEditor } from '../Editors';
import { PageType } from '../../../constants/Constants';
import { Portal } from '../../modal/Portal';

interface FileResult {
    lastModifiedDate: string | undefined;
    lastModified: number;
    name: string;
    size: number;
    type: string;
    src: string | ArrayBuffer | null;
}

const readFile = (file: File): Promise<FileResult> => {
    return new Promise((resolve) => {
        const reader = new FileReader();

        // This is called when finished reading
        reader.onload = (event) => {
            // Return an array with one image
            resolve({
                // These are attributes like size, name, type, ...
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                lastModifiedDate: file.lastModifiedDate,
                lastModified: file.lastModified,
                name: file.name,
                size: file.size,
                type: file.type,

                // This is the files content as base64
                src: event.target!.result,
            });
        };

        if (file.type.indexOf('text/') === 0 || file.type === 'application/json') {
            reader.readAsText(file);
        } else if (file.type.indexOf('image/') === 0) {
            reader.readAsDataURL(file);
        } else {
            reader.readAsBinaryString(file);
        }
    });
}

const mockUpload = (data: any, success: any, failed: any, progress: any) => {
    const doProgress = (percent?: any) => {
        progress(percent || 1);
        if (percent === 100) {
            // Start reading the file
            Promise.all(data.files.map(readFile)).then((files) =>
                success(files, { retainSrc: true })
            );
        } else {
            setTimeout(doProgress, 250, (percent || 0) + 10);
        }
    }

    doProgress();
}

interface State {

}

enum Styles {
    bold = "BOLD",
    italic = "ITALIC",
    underline = "UNDERLINE",
    strikethrough = "STRIKETHROUGH"
}

enum BlockTypes {
    H1 = "header-one",
    H2 = "header-two",
    H3 = "header-three",
    H4 = "header-four",
    H5 = "header-five",
    H6 = "header-six",
    BlockQuote = "blockquote",
    UL = "unordered-list-item",
    OL = "ordered-list-item",
    CodeBlock = "code-block"
}

const focusPlugin = createFocusPlugin();
const resizeablePlugin = createResizeablePlugin();
const blockDndPlugin = createBlockDndPlugin();
const alignmentPlugin = createAlignmentPlugin.default();
const linkifyPlugin = createLinkifyPlugin.default();
const testPlugin = test();
const { AlignmentTool } = alignmentPlugin;

const decorator = composeDecorators(
    resizeablePlugin.decorator,
    alignmentPlugin.decorator,
    focusPlugin.decorator,
    //testPlugin.decorator,
    blockDndPlugin.decorator,
);
const imagePlugin = createImagePlugin({ decorator: decorator as any, });

const dragNDropFileUploadPlugin = createDragNDropUploadPlugin.default({
    handleUpload: mockUpload,
    addImage: imagePlugin.addImage,
});

const plugins = [
    //testPlugin,
    dragNDropFileUploadPlugin,
    blockDndPlugin,
    focusPlugin,
    alignmentPlugin,
    resizeablePlugin,
    imagePlugin,
    linkifyPlugin
];

class RichTextEditor extends React.PureComponent<EditorProps, State> {

    editor: Editor | null = null;

    focusEditor = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {

        // if (e.target instanceof HTMLImageElement) {

        // }

        if (this.editor) {
            this.editor.focus();
        }
    }

    onToggleStyle = (style: Styles) => {
        const newState = RichUtils.toggleInlineStyle(this.props.content, style);
        this.props.onChange(newState);

        setTimeout(this.focusEditor);
    }

    onBlockType = (blockType: BlockTypes) => {
        const newState = RichUtils.toggleBlockType(this.props.content, blockType);
        this.props.onChange(newState);

        setTimeout(this.focusEditor);
    }

    insert = (url: string, name: string) => {
        const index = name.lastIndexOf('.');
        const fileType = name.substring(index, name.length);
        switch (fileType) {
            case ".jpg":
            case ".svg":
                this.insertImage(url);
                break;
            default:
                this.insertFile(url, name);
                break;
        }
    }

    insertFile = (url: string, name: string) => {
        //debugger;
        const contentState = this.props.content.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
            'FILE',
            'IMMUTABLE',
            { src: "www.google.com" });
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = EditorState.set(this.props.content, { currentContent: contentStateWithEntity });
        return AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' ');
    }

    insertImage = (url: string) => {
        const contentState = this.props.content.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
            'IMAGE',
            'IMMUTABLE',
            { src: url });
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = EditorState.set(this.props.content, { currentContent: contentStateWithEntity });
        return AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' ');
    };

    onHandlePastedFile = (files?: Blob[]): DraftHandleValue => {
        // debugger;
        // handle files not just images
        if (!files || files.length === 0) {
            return 'handled';
        }

        const file: File = files[0] as File;
        readFile(file).then(result => {
            const state = this.insertImage(result.src as string);
            this.props.onChange(state);
        });

        return 'handled';
    }

    onHandleDroppedFiles = (selectionState: SelectionState, files: Blob[]): DraftHandleValue => {
        //debugger;
        if (!files || files.length === 0) {
            return 'handled';
        }

        const file: File = files[0] as File;
        // debugger;
        readFile(file).then(result => {
            const state = this.insert(result.src as string, file.name);
            this.props.onChange(state);
        });

        return 'handled';
    }

    onTab = (e: React.KeyboardEvent) => {
        e.preventDefault();

        if (e.shiftKey) {
            // figure out how to get this to work
            const currentState = this.props.content;
            this.props.onChange(RichUtils.onTab(e, currentState, 4));
        } else {
            const currentState = this.props.content;
            const newContentState = Modifier.replaceText(
                currentState.getCurrentContent(),
                currentState.getSelection(),
                "    "
            );

            const newState = EditorState.push(currentState, newContentState, 'insert-characters');
            this.props.onChange(newState);
        }
    }

    onHandlePastedText = (text: string, html: string | undefined, editorState: EditorState): DraftHandleValue => {

        if (!!html && html.includes("<meta name=Originator content=\"Microsoft Word 15\">")) {
            const bodyMatch = html.match(/<body[^>]*>((.|[\n\r])*)<\/body>/g);

            if (!bodyMatch || bodyMatch.length === 0) {
                // paste text?
                return 'handled';
            }

            const body = bodyMatch[0];
            const bodyContent = body.replace(/<body[^>]*>/, "")
                .replace("</body>", "")
                //.replace(/<a[^>]*>((.|[\n\r])*)<\/a>/g, '{{Test}}')
                .replace(/<ul[^>]*>/g, "<ul class=\"public-DraftStyleDefault-ul\" style=\"background-color:red;\" type=\"disc\">")
                .replace(/MsoListParagraph/g, "\"public-DraftStyleDefault-unorderedListItem public-DraftStyleDefault-reset public-DraftStyleDefault-depth0 public-DraftStyleDefault-listLTR\"");

            const { contentBlocks, entityMap } = htmlToDraft(bodyContent)

            let contentState = Modifier.replaceWithFragment(
                editorState.getCurrentContent(),
                editorState.getSelection(),
                ContentState.createFromBlockArray(contentBlocks, entityMap).getBlockMap()
            )

            const newState = EditorState.push(editorState, contentState, 'insert-fragment')
            this.props.onChange(newState);
            return 'handled';
        }

        return 'not-handled';
    }

    // https://medium.com/@siobhanpmahoney/building-a-rich-text-editor-with-react-and-draft-js-part-2-4-persisting-data-to-server-cd68e81c820
    blockRenderer = (block: ContentBlock) => {
        const type = block.getType();
        if (type === "atomic") {

            //const entityType = Entity.get(block.getEntityAt(0)).getType();

            // if (entityType !== "FILE") {
            //     return null;
            // }
            // debugger;
            return {
                component: Media,
                editable: false,
                props: block.getData()
            };
        }

    }

    render() {
        return <div className="rich-text-editor">
            <div className="editor-toolbar">
                <div className="editor-toolbar-row">
                    <div className="editor-toolbar-button-group">
                        <button onClick={() => this.onToggleStyle(Styles.bold)}><i className="fa fa-bold"></i></button>
                        <button onClick={() => this.onToggleStyle(Styles.italic)}><i className="fa fa-italic"></i></button>
                        <button onClick={() => this.onToggleStyle(Styles.underline)}><i className="fa fa-underline"></i></button>
                        <button onClick={() => this.onToggleStyle(Styles.strikethrough)}><i className="fa fa-strikethrough"></i></button>
                    </div>
                    <span className="separator"></span>
                    <div className="editor-toolbar-button-group">
                        <button onClick={() => this.onBlockType(BlockTypes.H1)}>H1</button>
                        <button onClick={() => this.onBlockType(BlockTypes.H2)}>H2</button>
                        <button onClick={() => this.onBlockType(BlockTypes.H3)}>H3</button>
                        <button onClick={() => this.onBlockType(BlockTypes.H4)}>H4</button>
                        <button onClick={() => this.onBlockType(BlockTypes.H5)}>H5</button>
                        <button onClick={() => this.onBlockType(BlockTypes.H6)}>H6</button>
                    </div>
                    <span className="separator"></span>
                    <div className="editor-toolbar-button-group">
                        <button onClick={() => this.onBlockType(BlockTypes.BlockQuote)}><i className="fa fa-quote-right"></i></button>
                        <button onClick={() => this.onBlockType(BlockTypes.CodeBlock)}><i className="fa fa-code"></i></button>
                        <button onClick={() => this.onBlockType(BlockTypes.OL)}><i className="fa fa-list-ol"></i></button>
                        <button onClick={() => this.onBlockType(BlockTypes.UL)}><i className="fa fa-list-ul"></i></button>
                    </div>
                </div>
            </div>
            <div className="rich-text-content" onClick={this.focusEditor}>
                <Editor
                    placeholder="Your notes here..."
                    ref={e => (this.editor = e)}
                    editorState={this.props.content}
                    onChange={this.props.onChange}
                    handlePastedFiles={this.onHandlePastedFile}
                    handleDroppedFiles={this.onHandleDroppedFiles}
                    handlePastedText={this.onHandlePastedText}
                    plugins={plugins}
                    onTab={this.onTab}
                    blockRendererFn={this.blockRenderer}
                />
                <AlignmentTool />
            </div>
        </div>
    }
}

const Image = (props: any) => {
    if (!!props.src) {
        return <a><img src={props.src} />TEST</a>;
    }
    return null;
};
const Media = (props: any) => {
    const entity = props.contentState.getEntity(props.block.getEntityAt(0));
    const { src } = entity.getData();
    const type = entity.getType();
    return <img src={src} className="test" />;
};

export class RichTextEditorContainer implements IEditor {

    stringifySearchContent = (content: EditorState) => content.getCurrentContent().getPlainText();

    render = (props: EditorProps) => <RichTextEditor {...props} />;

    getDefaultContent = () => EditorState.createEmpty();

    parse = (page: IPage) => {
        if (!page?.content) {
            return EditorState.createEmpty();
        }

        const data = JSON.parse(page.content);

        return EditorState.createWithContent(convertFromRaw(data));
    }

    stringify = (page: IPageModifyRequest) => {
        const raw = convertToRaw(page.content.getCurrentContent());
        return JSON.stringify(raw);
    }

    type = PageType.RichText;
    icon = "bi bi-file-richtext-fill";
    displayName = "Rich Text";
}