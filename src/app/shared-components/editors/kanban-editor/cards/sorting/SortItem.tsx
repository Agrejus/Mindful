import * as React from 'react';
import { useDrop, useDrag, DropTargetMonitor } from 'react-dnd';
import { DraggableType, ICard, IColumn, IDraggable } from '../../Sorting';

interface Props {
    style?: React.CSSProperties;
    page: ICard;
    index: number,
    column: IColumn,
    moveCardHandler: (dragIndex: number, hoverIndex: number, data: ICard, dropTarget: ICard) => void,
    onChange: (fn: (data: ICard[]) => ICard[]) => void;
}

export const SortItem: React.FunctionComponent<Props> = (props) => {
    const {
        index,
        moveCardHandler,
        onChange,
        page,
        column
    } = props;
    const changeItemColumn = (currentItem: any, groupName: string) => {

        onChange((data: ICard[]) => {
            return data;
        });
    };

    const ref = React.useRef(null);

    const [, drop] = useDrop({
        accept: DraggableType.CARD,
        hover(item: IDraggable<ICard>, monitor: DropTargetMonitor) {

            if (!ref.current) {
                return;
            }

            const columnId = item.data.columnId;
            const hoverColumnId = page.columnId;
            const dragIndex = item.index;

            const hoverIndex = index;

            // Don't replace items with themselves
            if (dragIndex === hoverIndex && columnId === hoverColumnId) {
                return;
            }

            // Determine rectangle on screen
            const element = (ref.current as any)
            const hoverBoundingRect = element.getBoundingClientRect();

            // Get vertical middle
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            // Determine mouse position
            const clientOffset = monitor.getClientOffset()!;
            // Get pixels to the top
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;
            // Only perform the move when the mouse has crossed half of the items height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%
            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }
            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }

            // Time to actually perform the action
            moveCardHandler(dragIndex, hoverIndex, item.data, page);
            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            item.index = hoverIndex;
        }
    });

    const item: IDraggable<ICard> = {
        index,
        data: page,
        type: DraggableType.CARD
    };
    const [{ isDragging }, drag] = useDrag({
        item: item,
        end: (item, monitor) => {
            // const dropResult = monitor.getDropResult();
            // if (dropResult) {
            //     const { name } = dropResult;
            //     changeItemColumn(item, name);
            // }
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    });

    const opacity = isDragging ? 0.4 : 1;

    drag(drop(ref));

    const style: React.CSSProperties = {
        ...props.style,
        opacity
    }

    return (
        <div ref={ref} style={style}>
            {props.children}
        </div>
    );
};