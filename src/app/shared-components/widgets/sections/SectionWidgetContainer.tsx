import * as React from 'react';
import { render } from './section-widget';
import './SectionWidgetContainer.scss';

interface SectionWidgetContainerProps {
    widgets: IWidget[];
}

export const SectionWidgetContainer: React.FunctionComponent<SectionWidgetContainerProps> = (props) => {

    if (props.widgets == null || props.widgets.length === 0 || props.widgets.every(w => w.data == null || w.data == -1)) {
        return null
    }

    return <div className="section-widget-container">
        {
            props.widgets.map((w, i) => render(w, i))
        }
    </div>
}