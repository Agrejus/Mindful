import * as React from 'react';

interface Props {
    title: string;
    isToggled: boolean;
    className: string;
    onToggle: (value: boolean) => void;
}

export const DropdownButton: React.FunctionComponent<Props> = (props) => {

    return <div className="btn-group">
        <button className={`${props.className} dropdown-toggle`} onClick={() => props.onToggle(!props.isToggled)}>
            {props.title}
        </button>
        <div className={`dropdown-menu${props.isToggled ? " show" : ""}`}>
            {props.children}
        </div>
    </div>
}