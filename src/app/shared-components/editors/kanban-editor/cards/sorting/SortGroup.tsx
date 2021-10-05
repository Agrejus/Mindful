import * as React from 'react';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import { DraggableType, ICard, IColumn, IDraggable } from '../../Sorting';

interface Props {
    children: React.ReactNode;
    className: string;
    accept: DraggableType;
    column: IColumn;
    index: number;
    moveCardHandler: (dragIndex: number, hoverIndex: number, dragItem: ICard, dropTarget: IColumn) => void;
}

export const SortGroup: React.FunctionComponent<Props> = (props) => {
    const { children, className, accept, column, index, moveCardHandler } = props;
    const [{ isOver, canDrop }, drop] = useDrop({
        accept,
        drop: () => { },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop()
        }),
        // Override monitor.canDrop() function
        canDrop: (item: IDraggable<ICard>) => {
            return true;
            // const { DO_IT, IN_PROGRESS, AWAITING_REVIEW, DONE } = COLUMN_NAMES;
            // const { currentColumnName } = item;
            // return (
            //     currentColumnName === title ||
            //     (currentColumnName === DO_IT && title === IN_PROGRESS) ||
            //     (currentColumnName === IN_PROGRESS &&
            //         (title === DO_IT || title === AWAITING_REVIEW)) ||
            //     (currentColumnName === AWAITING_REVIEW &&
            //         (title === IN_PROGRESS || title === DONE)) ||
            //     (currentColumnName === DONE && title === AWAITING_REVIEW)
            // );
        },
        hover(item: IDraggable<ICard>, monitor: DropTargetMonitor) {

            // if (!ref.current) {
            //     return;
            // }

            const columnId = item.data.columnId;
            const hoverColumnId = column.id;
            const dragIndex = item.index;

            const hoverIndex = index;

            // Don't replace items with themselves
            if (columnId === hoverColumnId) {
                return;
            }

            // Time to actually perform the action
            moveCardHandler(dragIndex, hoverIndex, item.data, column);
            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            item.index = hoverIndex;

        }
    });

    const getStyle = (): React.CSSProperties => {
        if (isOver) {
            if (canDrop) {
                return {
                    backgroundColor: "#e5ffde",
                    borderRadius: "4px"
                };
            } else if (!canDrop) {
                return {
                    backgroundColor: "red"
                };
            }
        }

        return {};
    };

    return (
        <div
            ref={drop}
            className={className}
            style={getStyle()}
        >
            {children}
        </div>
    );
};