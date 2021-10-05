import { SortableItemUIProps } from '@progress/kendo-react-sortable';
import * as React from 'react';

interface Props {
    keyPart: string;
    onClick: (id: number) => void;
    idField: string;
    isSelected: boolean;
    displayField: string;
    onChangeColorClick?: () => void;
    onDeleteClick?: () => void;
    isEditing?: boolean;
    icon?: string;
    onEdit?: (value: string) => void;
    onSave?: (value: string) => void;
    rightIcon?: string;
    onRightIconClick?: (id: number) => void;
    dataItem: any;
    className?: string;
}

export const SortableNavButton: React.FunctionComponent<Props> = (props) => {

    const [value, setValue] = React.useState(props.dataItem[props.displayField] || "New");

    React.useEffect(() => {
        if (input) {
            input.focus();
        }
    })

    let input: HTMLInputElement | null = null;
    const click = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        props.onClick(props.dataItem[props.idField]);
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {

        if (e.which === 13 && props.onSave) {
            e.preventDefault();
            props.onSave(value);
            return;
        }
    }

    const onRightIconClick = (e: React.MouseEvent<HTMLHtmlElement, MouseEvent>) => {
        if (props.onRightIconClick) {
            e.preventDefault();
            e.stopPropagation();
            props.onRightIconClick(props.dataItem[props.idField]);
        }
    }

    const onBlur = () => {
        if (props.onSave) {
            props.onSave(value);
        }
    }

    const renderContent = () => {
        if (props.isEditing === true) {
            return <input ref={e => { input = e; }} onBlur={onBlur} onKeyDown={onKeyDown} onChange={e => setValue(e.target.value)} value={value} />
        }

        return <React.Fragment>
            {!!props.rightIcon && <i className={`${props.rightIcon} expand-icon`} onClick={onRightIconClick}></i>}
            {!!props.icon && <React.Fragment><i className={`${props.icon} icon-md display-icon`}></i>&nbsp;</React.Fragment>}
            {props.dataItem[props.displayField]}
            {props.children}
        </React.Fragment>
    }

    let additionalClassNames = ['nav-button'];

    if (props.isSelected === true) {
        additionalClassNames.push('nav-button-active');
    }

    if (props.className) {
        additionalClassNames = additionalClassNames.concat(props.className.split(' '));
    }

    const spanStyle : React.CSSProperties = {
        backgroundColor: props.dataItem.color,
        position: "absolute",
        width: "10px",
        top: 0,
        bottom: 0,
        left: 0,
        borderTopLeftRadius: "5px",
        borderBottomLeftRadius: "5px"
    };

    const style: React.CSSProperties = {
        cursor: "pointer"
    };
    const className = additionalClassNames.join(' ');

    return <div className={className} onClick={click} style={{
        ...style
    }}>
        {!!props.dataItem.color && <React.Fragment><span style={spanStyle}></span>&nbsp;</React.Fragment>}
        {renderContent()}
    </div>
}