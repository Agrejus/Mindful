import * as React from 'react';
import ReactMde, { Suggestion, SaveImageHandler, Command } from "react-mde";
import * as Showdown from "showdown";
import './MarkdownEditor.scss';
import "../../../../../node_modules/react-mde/lib/styles/scss/react-mde-all.scss";
import { IEditor } from '../Editors';
import { PageType } from '../../../constants/Constants';
import '../../../../../static/scripts/prism.css';
import { Modal } from '../../modal/Modal';
const Prism = require('../../../../../static/scripts/prism.js');

type TabTypes = "write" | "preview";

interface IMarkdownProps {
    tab: TabTypes;
    content: string;
}

interface State {
    isLanguagesModalVisible: boolean;
}

const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true,

});

class MarkdownEditor extends React.Component<EditorProps, State> {

    state: State = {
        isLanguagesModalVisible: false
    };

    componentDidMount() {
        const elements = document.getElementsByClassName("mde-text");

        if (elements && elements.length > 0) {
            elements[0].addEventListener('keydown', (e: any) => {
                if (e.key == 'Tab') {
                    e.preventDefault();

                    var start = e.target.selectionStart;
                    var end = e.target.selectionEnd;

                    // set textarea value to: text before caret + tab + text after caret
                    e.target.value = e.target.value.substring(0, start) + "\t" + e.target.value.substring(end);

                    // put caret at right position again
                    e.target.selectionStart = e.target.selectionEnd = start + 1;

                    // make sure we save our changes
                    this.onChange(e.target.value);
                }
            });
        }
    }

    onTabChange = (tab: TabTypes) => {
        const markdownProps = this.props.content as IMarkdownProps;
        markdownProps.tab = tab;
        this.props.onChange(markdownProps);
    }

    save: SaveImageHandler = async function* (data: ArrayBuffer) {
        // Promise that waits for "time" milliseconds
        const wait = function (time: number) {
            return new Promise((a: any, r) => {
                setTimeout(() => a(), time);
            });
        };

        // Upload "data" to your server
        // Use XMLHttpRequest.send to send a FormData object containing
        // "data"
        // Check this question: https://stackoverflow.com/questions/18055422/how-to-receive-php-image-data-over-copy-n-paste-javascript-with-xmlhttprequest

        await wait(2000);
        // yields the URL that should be inserted in the markdown
        yield "https://picsum.photos/300";
        await wait(2000);

        // returns true meaning that the save was successful
        return true;
    }

    onChange = (value: string) => {
        const markdownProps = this.props.content as IMarkdownProps;
        markdownProps.content = value;
        this.props.onChange(markdownProps);
    }

    highlight = (markdown: string) => {

        try {
            let html = converter.makeHtml(markdown);

            const matches = html.match(/<code[\s\S]*?<\/code>/g);
    
            if (matches) {
                matches?.forEach(w => {
    
                    const openingTagRegex = /<code(.)*?>/;
                    const innerHtml = w.replace("</code>", "").replace(openingTagRegex, "");
    
                    let language = "html";
                    const openingTagMatch = w.match(openingTagRegex);
    
                    if (openingTagMatch) {
                        const classNameMatch = openingTagMatch[0].match(/class="(.)*?"/);
    
                        if (classNameMatch) {
                            const classNames = classNameMatch[0].replace("class=\"", "").replace("\"", "");
                            language = classNames.split(' ')[0];
                        }
                    }
    
                    html = html.replace(innerHtml, Prism.highlight(innerHtml, Prism.languages[language], language))
                })
            }
    
            return this.decodeHtml(html);
        } catch (e) {
            return "MARKDOWN GENERATION ERROR";
        }
    }
    
    decodeHtml = (html: string) => {
        var txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    languagesCommand: Command = {
        icon: () => <span>Languages</span>,
        execute: ({ initialState, textApi }) => {
            this.setState({ isLanguagesModalVisible: true })
        }
    }

    render() {
        const markdownProps = this.props.content as IMarkdownProps;

        return <React.Fragment>
            <ReactMde
                commands={{ "languages": this.languagesCommand }}
                classes={{ reactMde: "markdown-editor", toolbar: "editor-toolbar" }}
                toolbarCommands={[["languages", "bold", "italic"]]}
                value={markdownProps.content}
                onChange={this.onChange}
                selectedTab={markdownProps.tab}
                onTabChange={this.onTabChange}
                generateMarkdownPreview={markdown =>
                    Promise.resolve(this.highlight(markdown))
                }
                childProps={{
                    writeButton: {
                        tabIndex: -1
                    }
                }}
                paste={{
                    saveImage: this.save
                }}
            />
            {this.state.isLanguagesModalVisible === true && <Modal
                buttons={["Ok"]}
                onClick={() => this.setState({ isLanguagesModalVisible: false })}
                title="Languages"
            >
                <ul>
                    {
                        Object.keys(Prism.languages).sort().map(w => <li key={w}>{w}</li>)
                    }
                </ul>
            </Modal>}
        </React.Fragment>
    }
}

export class MarkdownContainer implements IEditor {

    stringifySearchContent = (content: IMarkdownProps) => {
        return content.content;
    };

    render = (props: EditorProps) => <MarkdownEditor {...props} />;

    getDefaultContent = () => { return { tab: "write", content: "" } as IMarkdownProps };

    parse = (page: IPage) => {
        return JSON.parse(page.content);
    }

    stringify = (page: IPageModifyRequest) => {
        return JSON.stringify(page.content);
    }

    type = PageType.Markdown;
    icon = "bi bi-markdown";
    displayName = "Markdown";
}