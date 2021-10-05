import * as React from 'react';

interface Props {
    className?:string;
    onClick?:(e:React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
    iconClassName: string;
    title?:string;
}

export const IconButton: React.FunctionComponent<Props> = (props) => {
    const onClick= (e:React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        if (props.onClick) {
            props.onClick(e);
        }
    }

    let classNames = ["clickable", "ico-btn"];

    if (props.className) {
        classNames = classNames.concat(props.className.split(' '));
    }

    return <span title={props.title} className={classNames.join(' ')} onClick={onClick}>&nbsp;<i className={props.iconClassName}></i></span>
}