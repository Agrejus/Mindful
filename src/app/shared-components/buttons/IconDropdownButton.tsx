import * as React from 'react';
import { IconButton } from './IconButton';

interface Props {
    className?: string;
    iconClassName: string;
    isToggled:boolean;
    onToggle: (value: boolean) => void;
    title?:string;
}

export const IconDropdownButton: React.FunctionComponent<Props> = (props) => {

    let classNames = ["clickable"];

    if (props.className) {
        classNames = classNames.concat(props.className.split(' '));
    }

    return <div className="btn-group">
        <IconButton title={props.title} className="dropdown-toggle" onClick={() => props.onToggle(!props.isToggled)} iconClassName={props.iconClassName} />
        <div className={`dropdown-menu${props.isToggled ? " show" : ""}`}>
            {props.children}
        </div>
    </div>
}