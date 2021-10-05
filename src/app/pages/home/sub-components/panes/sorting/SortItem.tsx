import * as React from 'react';
import { useDrop, useDrag, DropTargetMonitor } from 'react-dnd';
import { DraggableType, IDraggable } from './Sorting';

interface Props {
    style?:React.CSSProperties;
    page: IPage;
    index: number,
    moveCardHandler: (dragIndex: number, hoverIndex: number, data: IPage, dropTarget: IPage) => void,
    onChange: (fn: (data: IPage[]) => IPage[]) => void;
}

export const SortItem: React.FunctionComponent<Props> = (props) => {
    const {
        index,
        moveCardHandler,
        onChange,
        page
    } = props;
    const changeItemColumn = (currentItem: any, groupName: string) => {

        onChange((data: IPage[]) => {
            return data;
        });
    };

    const ref = React.useRef(null);

    const [, drop] = useDrop({
        accept: ["HEAD", "CHILD"],
        hover(item: IDraggable<IPage>, monitor: DropTargetMonitor) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const groupId = item.groupId;
            const hoverIndex = index;
            const hoverGroupId = page.grouping.id;
            // Don't replace items with themselves
            if (dragIndex === hoverIndex && groupId === hoverGroupId) {
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

    const item: IDraggable<IPage> = {
        index,
        groupId: page.grouping.id,
        data: page,
        type: page.grouping?.isHead === true ? DraggableType.HEAD : DraggableType.CHILD
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
        <div ref={ref} className="movable-item" style={style}>
            {props.children}
        </div>
    );
};