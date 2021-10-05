import * as React from 'react';

interface Props<T> {
    contextMenuItems: ContextMenuItem<T>[];
    onShow?: () => void;
    activator?: ActivatorType
    className?: string;
}

interface State {
    visible: boolean;
    x: number;
    y: number;
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

export class ContextMenu<T> extends React.Component<Props<T>, State> implements IContextMenu {

    contextMenu: HTMLDivElement | null = null;

    state: State = {
        visible: false,
        x: 0,
        y: 0
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

        const windowWidth = window.innerWidth;
        const containerWidth = e.currentTarget.clientWidth;
// debugger;
        e.preventDefault();
        let clickX = e.clientX - 5;
        const clickY = e.clientY + 20;

        if ((clickX + containerWidth) > windowWidth) {
            clickX = clickX - containerWidth + 50;
        }

        this.setState({ visible: true, x: clickX, y: clickY });
    }

    renderContextMenu = () => {
        if (!this.props.activator || this.props.activator === "context-menu") {
            return <div onContextMenu={this.onContextMenu} className="context-menu-trigger">
                {this.props.children}
            </div>
        }

        return <div onClick={this.onContextMenu} className="context-menu-trigger">
            {this.props.children}
        </div>
    }

    render() {
        let classNames = ["context-menu"];

        if (this.props.className) {
            classNames = classNames.concat(this.props.className.split(' '));
        }

        const style: React.CSSProperties = {
            position: "fixed",
            zIndex: 9999,
            top: this.state.y,
            left: this.state.x
        };

        return <React.Fragment>
            {this.renderContextMenu()}
            {this.state.visible === true && <div className={classNames.join(' ')} style={style} ref={e => this.contextMenu = e}>
                {
                    this.props.contextMenuItems.map((w, i) => <a key={`context-menu-item-${i}`} onClick={e => w.onClick(e, w.data)} className="context-menu-item">
                        {!!w.icon && <React.Fragment><i className={w.icon}></i>&emsp;</React.Fragment>}
                        {w.text}
                    </a>)
                }
            </div>}
        </React.Fragment>
    }
}