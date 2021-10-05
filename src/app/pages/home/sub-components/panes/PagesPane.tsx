/// <reference path="../../../../data/page-repository.d.ts"/>
import * as React from 'react';
import { CreatableNavButton } from '../../../../shared-components/buttons/CreatableNavButton';
import { SortableNavButton } from '../../../../shared-components/buttons/SortableNavButton';
import { PageType } from '../../../../constants/Constants';
import { ButtonType, Modal } from '../../../../shared-components/modal/Modal';
import { InlineContextMenu, ContextMenuItem, IContextMenu } from '../../../../shared-components/context-menu/InlineContextMenu';
import { TreeView, TreeRowInfo, TreeNode } from 'react-draggable-tree';
import { editors, getIconClass } from '../../../../shared-components/editors/Editors';
import { DataSource } from '../../../../models/DataSource';
import { uniqBy } from 'lodash';

interface Props {
    pages: DataSource<IPage>;
    createNewPageType: PageType | null;
    selectedPage: IPage | null | undefined;
    onCreate: (name: string) => void;
    onDelete: (pageId: number) => void;
    onIsCreatingNewPageChange: (value: PageType) => void;
    onChange: (page: IPage) => void;
    onChanges: (pages:IPage[]) => void;
    onToggleContextMenu: () => void;
    treeRoot: TreeNode;
    selectedKeys: Set<number>;
    onTreeChange: (root: TreeNode, selectedKeys: Set<number>) => void;
}

interface State {
    showSplitButtonMenu: boolean;
    deletePage: IPage | null | undefined;
}

export class PagesPane extends React.PureComponent<Props, State> {

    state: State = {
        showSplitButtonMenu: false,
        deletePage: undefined
    }

    contextMenus: IContextMenu[] = []

    hideAllVisibleMenus = () => {
        const visibleMenus = this.contextMenus.filter(w => w.visible() === true);
        for (let contextMenu of visibleMenus) {
            contextMenu.hide();
        }
    }

    componentDidMount() {

        document.addEventListener("click", e => {

            const target = e.target as any;

            if (target instanceof HTMLAnchorElement && (target as HTMLAnchorElement).classList.contains("context-menu-item") === false) {
                this.hideAllVisibleMenus();
            }

            if (target instanceof HTMLDivElement && (target as HTMLDivElement).classList.contains("context-menu") === false) {
                this.hideAllVisibleMenus();
            }

            if (e.target instanceof HTMLButtonElement && (e.target as HTMLButtonElement).classList.contains("dropdown-toggle")) {
                return;
            }

            if (this.state.showSplitButtonMenu === true) {
                this.setState({
                    showSplitButtonMenu: false
                });
            }
        });
    }

    onDeleteClick = (pageId: number) => {
        const deletePage = this.props.pages.find(w => w.pageId === pageId);

        this.setState({
            deletePage
        });

    }

    handleModalClick = (button: ButtonType) => {

        if (button === "Cancel" || !this.state.deletePage) {
            this.setState({
                deletePage: null
            });
            return;
        }

        this.props.onDelete(this.state.deletePage.pageId);
        this.setState({ deletePage: null });
    }

    onDeletePageClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, data: IPage) => {
        e.preventDefault();
        this.setState({
            deletePage: data
        });
        this.props.onToggleContextMenu();
    }

    onRenamePageClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, data: IPage) => {
        e.preventDefault();

        data.isEditing = true;

        this.props.onChange(data);
        this.props.onToggleContextMenu();
    }

    renderAddPageMenuItems = () => {
        return editors.map((w, i) => <a key={`add-page-menu-${i}`} onClick={() => this.props.onIsCreatingNewPageChange(w.type)}><i className={w.icon}></i>&emsp;Add {w.displayName} Page</a>)
    }

    onSelectedKeysChange = (selectedKeys: Set<number>, selectedInfos: TreeRowInfo[]) => {

        const keys = selectedKeys.size > 0 ? [selectedKeys.values().next().value] : [];
        const pages = this.props.pages.clone();
        const changes: IPage[] = [];

        for(let i = 0; i < pages.length; i++) {
            const page = pages.getAt(i);

            if (!page.isSelected) {
                continue;
            }

            page.isSelected = false;
            changes.push(page);
         }
        
        if (selectedKeys.size === 1) {
            const key = selectedKeys.values().next().value;
            const page = pages.get(key);

            page.isSelected = true;

            if (changes.some(w => w.pageId === page.pageId) === false) {
                changes.push(page)
            }
        }

        this.props.onTreeChange(this.props.treeRoot, new Set<number>(keys));
        this.props.onChanges(pages.toList());
    }

    onCollapsedChange = (info: TreeRowInfo, collapsed: boolean) => {

        const root = { ...this.props.treeRoot };
        const node = this.getDescendant(root, info.path);

        if (!node) {
            return;
        }

        node.collapsed = collapsed;
        
        const page = this.props.pages.get(node.key as number);

        page.isCollapsed = collapsed;

        this.props.onTreeChange(root, this.props.selectedKeys);
        this.props.onChanges([page]);
    }

    onMove = (src: TreeRowInfo[], dest: TreeRowInfo, destIndex: number, destPathAfterMove: number[]) => {

        const root = this.props.treeRoot;
        const items: TreeNode[] = [];
        const changedParents: TreeNode[] = [];

        for (let i = src.length - 1; i >= 0; --i) {
            const { path } = src[i];
            const index = path[path.length - 1]
            const parent = this.getDescendant(root, path.slice(0, -1))!
            const [item] = parent.children!.splice(index, 1);
            changedParents.push(parent);
            items.unshift(item);
        }

        const destItem = this.getDescendant(root, destPathAfterMove.slice(0, -1))!;
        destItem.children!.splice(destPathAfterMove[destPathAfterMove.length - 1], 0, ...items);
        destItem.collapsed = false;

        const changes: IPage[] = [...items, ...changedParents, destItem].filter(w => w.key != -1).map(w => {
            const page = this.props.pages.get(w.key as number);
            page.children = !w.children ? [] : w.children.map(x => x.key as number);
            return page;
        });

        const rootOrderChanges = !root.children ? [] : root.children.map((w, i) => {
            const page = this.props.pages.get(w.key as number);
            page.order = i;
            return page;
        });

        const final = uniqBy([...changes, ...rootOrderChanges], w => w.pageId)

        this.props.onTreeChange(root, this.props.selectedKeys);
        this.props.onChanges(final)
    }


    getDescendant(root: TreeNode, path: number[]): TreeNode | undefined {
        if (path.length == 0) {
            return root
        } else if (root.children) {
            return this.getDescendant(root.children[path[0]], path.slice(1));
        }
    }

    onCopy = (src: TreeRowInfo[], dest: TreeRowInfo, destIndex: number) => {
        console.log('copy')
        // const {root} = this.state
        // const items: ExampleItem[] = []
        // for (let i = src.length - 1; i >= 0; --i) {
        //   const {path} = src[i]
        //   const index = path[path.length - 1]
        //   const parent = root.getDescendant(path.slice(0, -1))!
        //   const item = parent.children![index].clone()
        //   items.unshift(item)
        // }
        // const destItem = root.getDescendant(dest.path)!
        // destItem.children!.splice(destIndex, 0, ...items)
        // destItem.collapsed = false
        // this.setState({root})
    }

    render() {
        const menuClassNames = ['dropdown-menu'];

        if (this.state.showSplitButtonMenu) {
            menuClassNames.push('show');
        }

        const finalMenuClassNames = menuClassNames.join(' ');

        const buildContextMenuItems = (data: IPage): ContextMenuItem<IPage>[] => {

            const buttons = [
                { text: "Rename", onClick: this.onRenamePageClick, data, icon: "fas fa-i-cursor" },
                { text: "Delete", onClick: this.onDeletePageClick, data, icon: "far fa-trash-alt text-danger" }
            ];

            return buttons;
        }

        // keep the tree, it can be a map of how to render the items
        return <React.Fragment>
            {!!this.props.createNewPageType && <CreatableNavButton key={"new-page"} defaultText="New Page" onSave={this.props.onCreate} />}

            <div className="sort-container">
                {
                    this.props.pages.length > 0 && <TreeView
                        root={this.props.treeRoot}
                        selectedKeys={this.props.selectedKeys}
                        rowHeight={40}
                        rowContent={e => {

                            const page = this.props.pages.get(e.node.key as number);
                            return <InlineContextMenu<IPage>
                                onShow={this.props.onToggleContextMenu}
                                ref={e => { if (e) { this.contextMenus.push(e); } }}
                                contextMenuItems={buildContextMenuItems(page)}
                            >
                                <SortableNavButton
                                    className={"page-item-button"}
                                    keyPart="page-sortable-key"
                                    onDeleteClick={() => this.onDeleteClick(page.pageId)}
                                    onChangeColorClick={() => void (0)}
                                    displayField="pageName"
                                    icon={getIconClass(page.pageTypeId)}
                                    idField={'pageId'}
                                    onClick={() => void(0)}
                                    isEditing={page.isEditing}
                                    onEdit={x => this.props.onChange({ ...page, pageName: x })}
                                    onSave={x => this.props.onChange({ ...page, pageName: x, isEditing: false })}
                                    dataItem={page}
                                    isSelected={false}
                                />
                            </InlineContextMenu>
                        }}
                        onSelectedKeysChange={(keys, infos) => this.onSelectedKeysChange(keys as any, infos)}
                        onCollapsedChange={this.onCollapsedChange}
                        onMove={this.onMove}
                        onCopy={this.onCopy}
                    />
                }
            </div>
            <div className="btn-group dropup nav-button nav-button-add nav-button-split pages-add-btn-group">
                <button type="button" className="" onClick={() => this.props.onIsCreatingNewPageChange(PageType.PlainText)}>
                    <i className="bi bi-plus icon-md"></i>&nbsp;Add Page
                </button>
                <button type="button" onClick={() => this.setState({ showSplitButtonMenu: true })} className="dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span className="sr-only">Toggle Dropdown</span>
                </button>
                <div className={finalMenuClassNames}>
                    {this.renderAddPageMenuItems()}
                </div>
            </div>
            {this.state.deletePage && <Modal
                buttons={["Yes", "Cancel"]}
                onClick={this.handleModalClick}
                title="Delete Page?"
            >
                <p>Are you sure you wish to delete {this.state.deletePage.pageName}?</p>
            </Modal>}
        </React.Fragment>
    }
}