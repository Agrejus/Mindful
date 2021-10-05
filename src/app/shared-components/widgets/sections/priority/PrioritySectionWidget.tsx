/// <reference path="../../widgets.d.ts" />
/// <reference path="../../../../data/page-repository.d.ts" />
import { min } from 'lodash';
import * as React from 'React';
import { PageType, SectionWidgetType } from '../../../../constants/Constants';
import { DataSource } from '../../../../models/DataSource';
import { IBoard } from '../../../editors/kanban-editor/Sorting';
import { ISectionWidget, safeParse, safeStringify, SectionWidgetProps } from '../section-widget';

const icon = "bi bi-exclamation-circle";
const PrioritySectionWidgetItem: React.FunctionComponent<SectionWidgetProps> = (props) => {

    const data: number = props.data as number;

    return <div className={`widget ${props.classname}`}>
        <i className={`${icon} icon-md display-icon`}></i>
        <span className="badge badge-secondary">{data}</span>
    </div>
}

export class PrioritySectionWidget implements ISectionWidget {
    description = "Shows the greatest priority for all Kanban boards for the section";
    className = "priority-section-widget";
    availablePageTypes = [PageType.Kanban];
    name = "Priority";
    defaultValue = 1;
    render = (props: SectionWidgetProps, index: number) => {

        if (props.data == null || props.data == 0) {
            return null
        }

        if (this.className) {
            props.classname = this.className;
        }

        return <PrioritySectionWidgetItem {...props} key={`section-widget-${index}`} />
    }
    type = SectionWidgetType.Priority;
    icon = icon;
    parse = (widget: IWidget) => safeParse(widget.data);
    stringify = (widget: IWidget) => safeStringify(widget.data);
    onChange = (widget: IWidget, pages: DataSource<IPage>) => {

        // takes the max priority for a kanban board
        const foundPages = pages.filter(w => this.availablePageTypes.includes(w.pageTypeId));

        if (foundPages.length === 0) {
            widget.data = null;
            return;
        }

        const boards = foundPages.map(w => w.content as IBoard).filter(w => w.cards != null && w.cards.length > 0);
        const columns = boards.filter(w => w.columns != null && w.columns.length > 0).map(w => w.columns).reduce((a, b) => a.concat(b));
        const allCards = boards.filter(w => w.cards != null && w.cards.length > 0).map(w => w.cards).reduce((a, b) => a.concat(b)).filter(w => !w.isArchived);
        const progressColumnsIds = columns.filter(w => w.name.toLowerCase().includes("complete") === false).map(w => w.id);

        widget.data = min(allCards.filter(w => progressColumnsIds.includes(w.columnId) && w.priority != null && w.priority > 0).map(w => parseInt(w.priority as any)));
    }
}