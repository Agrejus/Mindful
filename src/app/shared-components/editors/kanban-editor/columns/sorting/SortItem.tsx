import * as React from 'react';
import { useDrop, useDrag, DropTargetMonitor } from 'react-dnd';
import { DraggableType, IColumn, IDraggable } from '../../Sorting';

interface Props {
    style?:React.CSSProperties;
    page: IColumn;
    index: number,
    moveCardHandler: (dragIndex: number, hoverIndex: number, data: IColumn, dropTarget: IColumn) => void,
    onChange: (fn: (data: IColumn[]) => IColumn[]) => void;
}

export const SortItem: React.FunctionComponent<Props> = (props) => {
    const {
        index,
        moveCardHandler,
        onChange,
        page
    } = props;
    const changeItemColumn = (currentItem: any, groupName: string) => {

        onChange((data: IColumn[]) => {
            return data;
        });
    };

    const ref = React.useRef(null);

    const [, drop] = useDrop({
        accept: DraggableType.COLUMN,
        hover(item: IDraggable<IColumn>, monitor: DropTargetMonitor) {
            if (!ref.current) {
                return;
            }

            const dragIndex = item.index;
            const hoverIndex = index;
            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return;
            }
            // Determine rectangle on screen
            const element = (ref.current as any)
            const hoverBoundingRect = element.getBoundingClientRect();

            // Get vertical middle
            const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
            // Determine mouse position
            const clientOffset = monitor.getClientOffset()!;
            // Get pixels to the top
            const hoverClientX = clientOffset.x - hoverBoundingRect.left;
            // Only perform the move when the mouse has crossed half of the items height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%
            // Dragging downwards

            if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
                return;
            }
            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
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

    const item: IDraggable<IColumn> = {
        index,
        data: page,
        type: DraggableType.COLUMN
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

    const style:React.CSSProperties = {
        ...props.style,
        opacity
    }

    return (
        <div ref={ref} className="column" style={style}>
            {props.children}
        </div>
    );
};