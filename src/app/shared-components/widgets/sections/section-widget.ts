import { PrioritySectionWidget } from './priority/PrioritySectionWidget';
import { PageType, SectionWidgetType } from "../../../constants/Constants"
import { KanbanSectionWidget } from "./kanban/KanbanSectionWidget"
import { DataSource } from '../../../models/DataSource';

let widgets: { [key: number]: ISectionWidget } = {
    1: new KanbanSectionWidget(),
    2: new PrioritySectionWidget()
}

export const allWidgets = Object.keys(widgets).map(w => widgets[w as any]);

export interface ISectionWidget {
    className?: string;
    render: (props: SectionWidgetProps, index: number) => React.ReactNode;
    type: SectionWidgetType;
    icon: string;
    parse: (widget: IWidget) => any;
    stringify: (widget: IWidget) => string | null;
    onChange: (widget: IWidget, pages: DataSource<IPage>) => void;
    defaultValue: any;
    name: string;
    availablePageTypes: PageType[];
    description: string;
}

export interface SectionWidgetProps {
    data: any;
    classname?: string;
}

export const render = (widget: IWidget, index: number) => {
    const sectionWidget = widgets[widget.type];

    if (!sectionWidget) {
        return null;
    }

    return sectionWidget.render({
        data: widget.data
    }, index);
}

export const getDescription = (type: SectionWidgetType) => {
    const sectionWidget = widgets[type];

    if (!sectionWidget) {
        return null;
    }

    return sectionWidget.description;
}

export const isAllowed = (type: SectionWidgetType, pageType: PageType) => {
    return allWidgets.some(w => w.type === type && w.availablePageTypes.includes(pageType))
}

export const getDefaultValue = (type: SectionWidgetType) => {
    const sectionWidget = widgets[type];

    if (!sectionWidget) {
        return null;
    }

    return sectionWidget.defaultValue;
}

export const onChange = (widget: IWidget, pages: DataSource<IPage>) => {
    const sectionWidget = widgets[widget.type];

    if (!sectionWidget) {
        return null;
    }

    sectionWidget.onChange(widget, pages)
}

export const stringify = (widget: IWidget) => {
    const sectionWidget = widgets[widget.type];

    if (!sectionWidget) {
        return null;
    }

    return sectionWidget.stringify(widget);
}

export const parse = (widget: IWidget) => {
    const sectionWidget = widgets[widget.type];

    if (!sectionWidget) {
        return null;
    }


    return sectionWidget.parse(widget);
}

export const safeParse = (data: string | null) => {
    if (!data) {
        return null;
    }

    return JSON.parse(data)
}

export const safeStringify = (data: any) => {
    if (!data) {
        return null;
    }

    return JSON.stringify(data);
}