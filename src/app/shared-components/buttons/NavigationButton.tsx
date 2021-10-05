import { SortableItemUIProps } from '@progress/kendo-react-sortable';
import * as React from 'react';

export interface NavigationButtonProps<T> extends SortableItemUIProps {

    onClick?: (id: number) => void;
    idField?: string;
    displayField?: string;
    dataItem: T;

    isSelected?: boolean;
    className?: string;
    isEditing?: boolean;
    onEditComplete?: (dataItem: T) => void;
    defaultValue?: string;
    color?: string;
    icon?: string;
    favicon?:string;
}

interface State {
    value: string;
}

export class NavigationButton<T> extends React.Component<NavigationButtonProps<T>, State> {

    input: HTMLInputElement | null = null;

    state: State = {
        value: this.props.defaultValue || ""
    }

    getColorIndicatorStyle = (): React.CSSProperties => {
        return {
            backgroundColor: `${this.props.color}`,
            position: "absolute",
            width: 10,
            top: 0,
            bottom: 0,
            left: 0,
            borderTopLeftRadius: 5,
            borderBottomLeftRadius: 5
        }
    }

    click = () => {
        if (this.props.isDragCue === false && this.props.isDragged === false && this.props.isDisabled === false && this.props.onClick && this.props.idField) {
            this.props.onClick((this.props.dataItem as any)[this.props.idField]);
        }
    }

    onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {

        if (e.which === 13 && this.props.onEditComplete && this.props.displayField) {
            e.preventDefault();
            this.props.onEditComplete({
                ...this.props.dataItem,
                [this.props.displayField]: this.state.value
            });
            return;
        }
    }

    onBlur = (e: React.FocusEvent<HTMLInputElement>) => {

        if (this.props.onEditComplete && this.props.displayField) {
            this.props.onEditComplete({
                ...this.props.dataItem,
                [this.props.displayField]: this.state.value
            });
        }
    }

    renderInternal = () => {

        if (this.props.isEditing === true) {
            return <input
                onBlur={this.onBlur}
                ref={e => this.input = e}
                onKeyDown={this.onKeyDown}
                className="creatable-nav-button-value"
                value={this.state.value}
                type="text"
                onChange={e => this.setState({ value: e.target.value })}
            />
        }

        return <React.Fragment>{this.props.displayField ? (this.props.dataItem as any)[this.props.displayField] : null}{this.props.children}</React.Fragment>
    }

    render() {

        const spanIndicatorStyle = this.getColorIndicatorStyle();
        let additionalClassNames = ['nav-button'];

        if (this.props.isDisabled === true) {
            additionalClassNames.push('k-state-disabled');
        }

        if (this.props.isSelected === true) {
            additionalClassNames.push('nav-button-active');
        }

        if (this.props.className) {
            additionalClassNames.push(this.props.className);
        }

        const style = {
            ...this.props.style,
            cursor: "pointer"
        }
        const className = additionalClassNames.join(' ');

        return <div className={className} onClick={() => this.click()} ref={this.props.forwardRef} {...this.props.attributes} style={style}>
            {!!this.props.color && <React.Fragment><span style={spanIndicatorStyle}></span>&nbsp;</React.Fragment>}
            {!!this.props.icon && <React.Fragment><i className={this.props.icon}></i>&nbsp;</React.Fragment>}
            {!!this.props.favicon && <React.Fragment><img src={this.props.favicon}/>&nbsp;</React.Fragment>}
            {/* {<img  src="https://www.tileshop.com/favicon.ico"/>} */}
            {this.renderInternal()}
        </div>
    }
}