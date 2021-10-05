import * as React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { SortGroup } from './SortGroup';
import { orderBy } from 'lodash';
import { SortItem } from './SortItem';
import { DraggableType } from './Sorting';
import { cloneShallow } from '../../../../../helpers/helpers';

interface Props {
    data: IPage[];
    itemUI: (item: IPage, index: number) => React.ReactNode
    onChange: (data: IPage[]) => void;
}

export const SortContainer: React.FunctionComponent<Props> = (props) => {

    const onItemChange = (fn: (data: IPage[]) => IPage[]) => {
        const changedItems = fn(props.data);
        props.onChange(changedItems);
    }

    const moveCardHandler = (dragIndex: number, hoverIndex: number, dragItem: IPage, dropTarget: IPage) => {

        const { data } = props;
        const coppiedStateArray = [...data];
        let dropIndex = coppiedStateArray.findIndex(w => w.pageId == dropTarget.pageId);
        const destinationIndex = coppiedStateArray.findIndex(w => w.pageId == dragItem.pageId);

        const isChangingGroups = dropTarget.grouping.id !== dragItem.grouping.id;

        if (dragItem.grouping.isHead === false) {

            if (dropTarget.grouping.isHead === true && dropIndex < destinationIndex) {

                if (dropTarget.grouping.isExpanded === false) {
                    dropTarget.grouping.isExpanded = true;
                }

                if (isChangingGroups) {
                    dropIndex = destinationIndex;
                } else {
                    return;
                }
            }

            // Don't want to remove the group its in if we are the head of a group
            dragItem.grouping = { ...dropTarget.grouping };
            dragItem.grouping.isHead = false;

            coppiedStateArray.splice(destinationIndex, 1);
            coppiedStateArray.splice(dropIndex, 0, dragItem);
        } else {

            if (dropTarget.grouping.isHead === true && dropIndex < destinationIndex) {
                return;
            }

            if (dropTarget.grouping.id === dragItem.grouping.id) {
                return;
            }

            const count = data.filter(w => w.grouping.id === dragItem.grouping.id).length;
            const removed = coppiedStateArray.splice(destinationIndex, count);
            coppiedStateArray.splice(dropIndex, 0, ...removed);
        }

        coppiedStateArray.map((w, i) => {
            w.order = i;
            return w;
        });

        props.onChange(coppiedStateArray);
    };

    const render = () => {
        const orderedData = orderBy(props.data, w => w.order);

        const groups: IPage[][] = [];

        let lastGroupId = null;
        let index = 0;
        for (let item of orderedData) {
            if (item.grouping.id != lastGroupId) {
                index = groups.length;
                lastGroupId = item.grouping.id;
                groups.push([item]);
                continue;
            }

            if (groups.length === 0) {
                groups.push([]);
            }
            groups[index].push(item);
        }

        return groups.map((w, i) => {
            const head = w.find(w => w.grouping.isHead === true);
            return <SortGroup
                accept={DraggableType.CHILD}
                className="sort-group"
                key={`sort-group-${i}`}>
                {
                    w.map((x, j) => {

                        const style: React.CSSProperties = {
                            display: ""
                        };

                        if (head != null && x.grouping.isHead === false) {

                            if (head.grouping.isExpanded === false) {
                                style.display = "none";
                            }

                            style.marginLeft = "20px";
                        }

                        return <SortItem
                            key={`sort-item-${j}`}
                            style={style}
                            index={j}
                            moveCardHandler={moveCardHandler}
                            onChange={onItemChange}
                            page={x}
                        >{props.itemUI(x, j)}</SortItem>
                    })
                }
            </SortGroup>
        })
    }

    return <div className="sort-container">
        <DndProvider backend={HTML5Backend}>
            {render()}
        </DndProvider>
    </div>
}