import * as React from 'react';

interface Props {
    className?: string;
}

export const Pane: React.FunctionComponent<Props> = (props) => {

    let classNames = ["pane-content"];

    if (!!props.className) {
        classNames = classNames.concat(props.className.split(' '));
    }

    const finalClassNames = classNames.join(' ');

    return <div className={finalClassNames}>{props.children}</div>
}