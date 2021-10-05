import * as React from 'react';

interface Props {
    text:string;
    className?:string;
    onClick?:(e:React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
    iconClassName: string;
}

export const HoverExpandButton: React.FunctionComponent<Props> = (props) => {
    const onClick= (e:React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        if (props.onClick) {
            props.onClick(e);
        }
    }

    let classNames = ["fa-name-expand", "clickable"];

    if (props.className) {
        classNames = classNames.concat(props.className.split(' '));
    }

    return <span className={classNames.join(' ')} onClick={onClick}><span>{props.text}</span>&nbsp;<i className={props.iconClassName}></i></span>
}