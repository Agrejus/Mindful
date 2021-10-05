/// <reference path="../shared-components/widgets/widgets.d.ts"/>
/// <reference path="../data/data.d.ts"/>

declare interface ISection extends ISectionModifyRequest {
    sectionId: number;
}

declare interface ISectionModifyRequest {
    sectionName: string;
    order: number;
    color: string;
    isDisabled: boolean;
    isSelected: boolean;
    createDateTime: string;
    isContextMenuVisible?: boolean;
    widgets: IWidget[];
    settings: ISectionSettings;
    isArchived: boolean;
}

declare interface ISectionSettings {
    url?: string;
}