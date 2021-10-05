import * as React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { SortGroup } from './SortGroup';
import { SortItem } from './SortItem';
import { DraggableType, ICard, IColumn } from '../../Sorting';

interface Props {
    data: ICard[];
    column: IColumn;
    itemUI: (item: ICard, index: number) => React.ReactNode
    onChange: (data: ICard[]) => void;
    index: number;
    archivedCardsVisible: boolean;
    searchText: string;
}

export const CardSortContainer: React.FunctionComponent<Props> = (props) => {

    const onItemChange = (fn: (data: ICard[]) => ICard[]) => {
        const changedItems = fn(props.data);
        props.onChange(changedItems);
    }

    const moveCardHandler = (dragIndex: number, hoverIndex: number, dragItem: ICard, dropTarget: ICard) => {

        const coppiedStateArray = [...props.data];
        const sourceIndex = coppiedStateArray.findIndex(w => w.id === dragItem.id);
        const targetIndex = coppiedStateArray.findIndex(w => w.id === dropTarget.id);
        const items = coppiedStateArray.splice(targetIndex, 1, dragItem);
        coppiedStateArray.splice(sourceIndex, 1, items[0]);

        props.onChange(coppiedStateArray);
    };

    const moveColumnHandler = (dragIndex: number, hoverIndex: number, dragItem: ICard, dropTarget: IColumn) => {
        const coppiedStateArray = [...props.data];
        const sourceIndex = coppiedStateArray.findIndex(w => w.id === dragItem.id);
        coppiedStateArray[sourceIndex].columnId = dropTarget.id;
        props.onChange(coppiedStateArray);
    }

    let data = props.data.filter(w => w.columnId === props.column.id);

    if (props.archivedCardsVisible === false) {
        data = data.filter(w => !w.isArchived)
    }

    if (props.searchText) {
        data = data.filter(w => w.name.toLowerCase().includes(props.searchText) || w.content.toLowerCase().includes(props.searchText));
    }

    return <DndProvider backend={HTML5Backend}>
        <SortGroup
            moveCardHandler={moveColumnHandler}
            index={props.index}
            column={props.column}
            accept={DraggableType.CARD}
            className="kanban-column-body">
            {
                data.map((x, j) => <SortItem
                    key={`card-sort-item-${j}`}
                    index={j}
                    moveCardHandler={moveCardHandler}
                    onChange={onItemChange}
                    page={x}
                    column={props.column}
                >{props.itemUI(x, j)}</SortItem>)
            }
        </SortGroup>
    </DndProvider>
}