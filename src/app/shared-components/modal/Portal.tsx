import * as React from 'react';
import { createPortal } from 'react-dom';

interface Props {
    id: string;
}

export const Portal: React.FunctionComponent<Props> = (props) => {

    if (!props.children) {
        return null
    }

    const mount = document.getElementById(props.id)!;

    return createPortal(<div className="full-modal-container">
        <div className="full-modal">
            {props.children}
        </div>
    </div>, mount);
}