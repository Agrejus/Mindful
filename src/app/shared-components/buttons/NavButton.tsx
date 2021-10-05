import * as React from 'react';
import styled from 'styled-components';

interface Props {
    className?: string;
    color?: string;
    icon?: string;
    onClick: () => void;
    isSelected: boolean;
}

export const NavButton: React.FunctionComponent<Props> = (props) => {

    let additionalClassNames: string[] = ['nav-button'];

    if (!!props.className) {
        additionalClassNames = additionalClassNames.concat(props.className.split(' '));
    }

    if (props.isSelected === true) {
        additionalClassNames.push('nav-button-active');
    }

    const Span = styled.span`
        background-color: ${props.color};
        position: absolute;
        width: 10px;
        top: 0;
        bottom: 0;
        left: 0;
    `;

    const className = additionalClassNames.join(' ');
    return <div onClick={e => props.onClick()} className={className}>
        {!!props.color && <React.Fragment><Span></Span>&nbsp;</React.Fragment>}
        {!!props.icon && <React.Fragment><i className={props.icon}></i>&nbsp;</React.Fragment>}
        {props.children}
    </div>
}