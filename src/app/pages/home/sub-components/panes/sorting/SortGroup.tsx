import * as React from 'react';
import { useDrop } from 'react-dnd';
import { DraggableType, IDraggable } from './Sorting';

interface Props {
    children: React.ReactNode;
    className: string;
    accept: DraggableType;
}

export const SortGroup: React.FunctionComponent<Props> = (props) => {
    const { children, className, accept } = props;
    const [{ isOver, canDrop }, drop] = useDrop({
        accept,
        drop: () => {},
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop()
        }),
        // Override monitor.canDrop() function
        canDrop: (item: IDraggable<IPage>) => {
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