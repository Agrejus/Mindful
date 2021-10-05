import * as React from 'react';
import './VerticalPillNav.scss';

interface Props {

}

export const VerticalPillNav: React.FunctionComponent<Props> = (props) => {

    return <div className="vertical-pill-nav">
        <div className="row">
            <aside className="col-sm-2">
                <div className="nav-button">Test</div>
            </aside>
            <div className="col-sm-10">
                Content
            </div>
            <button className="vertical-pill-nav-add">Add Section</button>
        </div>
    </div>
}