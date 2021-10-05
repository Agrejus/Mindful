declare interface IPage extends IPageModifyRequest {
    pageId: number;
    pageGroupId: number;

}

declare interface IPageSkinnyRequest {
    pageId: number;
    order: number;
    isSelected: boolean;
    pageGroupId: number;
}

declare interface IPageModifyRequest {
    pageName: string;
    content: any;
    sectionId: number;
    isPinned: boolean;
    isSelected: boolean;
    isContextMenuVisible?: boolean;
    isEditing?: boolean;
    isSynced?: boolean;
    createDateTime: string;
    order: number;
    pageTypeId: number;
    children: number[];
    isCollapsed: boolean;
}

declare interface IPageChild {
    id: number;
    parentId:number;
}