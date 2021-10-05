import * as React from 'react';

interface Props<T> {
    contextMenuItems: ContextMenuItem<T>[];
    onShow?: () => void;
    activator?: ActivatorType
    className?: string;
}

interface State {
    visible: boolean;
}

export interface ContextMenuItem<T> {
    icon?: string;
    onClick: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, data: T) => void;
    text: string;
    data: T;
}

type ActivatorType = "context-menu" | "click";

export interface IContextMenu {
    contextMenu: HTMLDivElement | null;
    hide: () => void;
    visible: () => boolean;
}

export class InlineContextMenu<T> extends React.Component<Props<T>, State> implements IContextMenu {

    contextMenu: HTMLDivElement | null = null;

    state: State = {
        visible: false
    }

    hide = () => {
        this.setState({ visible: false })
    }

    visible = () => {
        return this.state.visible;
    }

    onContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (this.props.onShow) {
            this.props.onShow();
        }

        this.setState({ visible: true});
    }

    render() {
        let classNames = ["inline-context-menu"];

        if (this.props.className) {
            classNames = classNames.concat(this.props.className.split(' '));
        }

        if (!this.props.activator || this.props.activator === "context-menu") {
            return <div onContextMenu={this.onContextMenu} className="inline-context-menu-trigger">
                {this.props.children}
                {this.state.visible === true && <div className={classNames.join(' ')} ref={e => this.contextMenu = e}>
                    {
                        this.props.contextMenuItems.map((w, i) => <a key={`context-menu-item-${i}`} onClick={e => w.onClick(e, w.data)} className="context-menu-item">
                            {!!w.icon && <React.Fragment><i className={w.icon}></i>&emsp;</React.Fragment>}
                            {w.text}
                        </a>)
                    }
                </div>}
            </div>
        }

        return <div onClick={this.onContextMenu} className="inline-context-menu-trigger">
            {this.props.children}
            {this.state.visible === true && <div className={classNames.join(' ')} ref={e => this.contextMenu = e}>
                {
                    this.props.contextMenuItems.map((w, i) => <a key={`context-menu-item-${i}`} onClick={e => w.onClick(e, w.data)} className="context-menu-item">
                        {!!w.icon && <React.Fragment><i className={w.icon}></i>&emsp;</React.Fragment>}
                        {w.text}
                    </a>)
                }
            </div>}
        </div>
    }
}