import * as React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { SortGroup } from './SortGroup';
import { SortItem } from './SortItem';
import { DraggableType, IColumn } from '../../Sorting';

interface Props {
    data: IColumn[];
    itemUI: (item: IColumn, index: number) => React.ReactNode
    onChange: (data: IColumn[]) => void;
}

export const SortContainer: React.FunctionComponent<Props> = (props) => {

    const onItemChange = (fn: (data: IColumn[]) => IColumn[]) => {
        const changedItems = fn(props.data);
        props.onChange(changedItems);
    }

    const moveCardHandler = (dragIndex: number, hoverIndex: number, dragItem: IColumn, dropTarget: IColumn) => {

        if (dragItem.id == dropTarget.id) {
            return;
        }

        // https://medium.com/litslink-frontend-development/react-dnd-in-examples-ce509b25839d
        const coppiedStateArray = [...props.data];
        const items = coppiedStateArray.splice(hoverIndex, 1, dragItem);
        coppiedStateArray.splice(dragIndex, 1, items[0]);

        props.onChange(coppiedStateArray);
    };

    return <div className="card-sort-container">
        <DndProvider backend={HTML5Backend}>
            <SortGroup
                accept={DraggableType.COLUMN}
                className="sort-group">
                {
                    props.data.map((x, j) => <SortItem
                        key={`sort-item-${j}`}
                        index={j}
                        moveCardHandler={moveCardHandler}
                        onChange={onItemChange}
                        page={x}
                    >{props.itemUI(x, j)}</SortItem>)
                }
            </SortGroup>
        </DndProvider>
    </div>
}