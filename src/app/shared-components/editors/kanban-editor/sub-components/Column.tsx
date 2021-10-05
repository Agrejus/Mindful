import * as React from 'react';
import { ICard, IColumn } from '../Sorting';
import { ContextMenu, ContextMenuItem } from '../../../context-menu/ContextMenu';
import { CardSortContainer } from '../cards/sorting/CardSortContainer';
import * as moment from 'moment';

interface ColumnProps {
    searchText: string;
    archivedCardsVisible: boolean;
    column: IColumn;
    cards: ICard[];
    registerRef: (contextMenu: ContextMenu<IColumn> | null, index: number) => void;
    index: number;
    contextMenuItems: ContextMenuItem<IColumn>[];
    cardContextMenuItems: (card: ICard) => ContextMenuItem<ICard>[];
    cardRegisterRef: (contextMenu: ContextMenu<ICard> | null, index: number) => void;
    onChange: (cards: ICard[]) => void;
}

export const Column: React.FunctionComponent<ColumnProps> = (props) => {

    React.useEffect(() => {

        [...document.getElementsByClassName("kanban-card-body")].forEach(e => {

            if (e.clientHeight >= 100) {
                e.classList.add("kanban-card-more");
            } else {
                e.classList.remove("kanban-card-more");
            }

        });
    });

    const count = props.cards.filter(w => w.columnId === props.column.id && w.isArchived === false).length;

    return <div className="kanban-column">
        <div className="kanban-column-header">
            <span className="badge badge-secondary kanban-column-header-count">{count}</span>
            {props.column.name}
            <ContextMenu<IColumn>
                className="column-context-menu"
                activator="click"
                ref={e => props.registerRef(e, props.index)}
                contextMenuItems={props.contextMenuItems}
            >
                <i className="bi bi-three-dots kanban-column-header-button clickable"></i>
            </ContextMenu>
        </div>
        <hr />
        <CardSortContainer
            archivedCardsVisible={props.archivedCardsVisible}
            searchText={props.searchText}
            index={props.index}
            data={props.cards}
            column={props.column}
            itemUI={(w, i) => <div key={`kanban-card-${props.column.id}-${i}`} className={`kanban-card${w.isArchived ? " kanban-card-archived" : ""}`}>
                <div className="kanban-card-header">
                    <i className="bi bi-card-text"></i>&nbsp;<span className="kanban-card-header-title">{w.name}</span>
                    <ContextMenu<ICard>
                        className="column-context-menu"
                        activator="click"
                        ref={e => props.cardRegisterRef(e, w.id)}
                        contextMenuItems={props.cardContextMenuItems(w)}
                    >
                        <i className="bi bi-three-dots kanban-card-header-actions clickable"></i>
                    </ContextMenu>
                    <div className="kanban-card-sub-header">
                        {w.dateEdited && <small>{moment(w.dateEdited).format('MM/DD/YYYY, h:mm A')}</small>}
                    </div>
                    {w.priority != -1 && <div className="kanban-card-sub-header">
                        {w.priority != null && <small>Priority: {w.priority}</small>}
                    </div>}
                </div>
                {w.content && <hr className="kanban-card-separator" />}
                <div className="kanban-card-body">
                    <p dangerouslySetInnerHTML={{ __html: parseContent(w.content) }}></p>
                    <div className="more text-center">More +</div>
                </div>
            </div>}
            onChange={props.onChange} />
    </div>
}

const parseContent = (content: string) => {

    const regex = /(#Page::)([0-9]*)(::[A-z0-9]*)/g;
    const match = content.match(regex);

    if (match == null) {
        return content;
    }

    let result = content;
    match.forEach(value => {

        const split = value.split("::");
        result = result.replace(value, `<a data-link="${split[0]}:${split[1]}">#${split[2].replace(/_/g, ' ')}</a>`);
    });

    return result;
}