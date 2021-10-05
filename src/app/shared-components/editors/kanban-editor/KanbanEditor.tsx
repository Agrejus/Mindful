/// <reference path="../Editors.d.ts"/>
import * as React from 'react';
import './KanbanEditor.scss';
import { IEditor } from '../Editors';
import { PageType } from '../../../constants/Constants';
import { SortContainer } from './columns/sorting/SortContainer';
import { IBoard, ICard, IColumn } from './Sorting';
import { ContextMenu, ContextMenuItem } from '../../context-menu/ContextMenu';
import { ButtonType, Modal } from '../../modal/Modal';
import { AddEditColumnModal } from './sub-components/AddEditColumnModal';
import { Column } from './sub-components/Column';
import { AddEditCardModal } from './sub-components/AddEditCardModal';
import { max } from 'lodash';

interface State {
    deleteColumn: IColumn | null;
    deleteCard: ICard | null;
    isAddColumnModalVisible: boolean;
    addEditCard: ICard | null;
    showArchivedCards: boolean;
    searchText: string;
}

class KanbanEditor extends React.Component<EditorProps, State> {

    contextMenus: { [key: number]: ContextMenu<IColumn> } = {}
    cardContextMenus: { [key: number]: ContextMenu<ICard> } = {}
    sumColumnIds: number[] = (this.props.content as IBoard).columns.filter(w => w.name.toLowerCase().includes("new") || w.name.toLowerCase().includes("progress")).map(w => w.id)
    state: State = {
        deleteColumn: null,
        isAddColumnModalVisible: false,
        addEditCard: null,
        deleteCard: null,
        showArchivedCards: false,
        searchText: ""
    }

    hideAllContextMenus = (e: MouseEvent) => {
        if (e.target instanceof HTMLElement && (e.target as HTMLElement).classList.contains("bi-three-dots")) {
            return;
        }
        const keys = Object.keys(this.contextMenus);
        const cardKeys = Object.keys(this.cardContextMenus);

        for (let key of keys) {
            this.contextMenus[key as any].hide()
        }

        for (let cardKey of cardKeys) {
            this.cardContextMenus[cardKey as any].hide()
        }
    }

    componentDidMount() {
        document.addEventListener("click", this.hideAllContextMenus);
    }

    componentWillUnmount() {
        document.removeEventListener("click", this.hideAllContextMenus);
    }

    onDragChange = (data: IColumn[]) => {
        const board: IBoard = this.props.content as IBoard;
        board.columns = [...data];
        this.props.onChange(board);
    }

    onColumnChange = (column: IColumn) => {
        const board: IBoard = this.props.content as IBoard;
        const columnIndex = board.columns.findIndex(w => w.id === column.id);
        board.columns[columnIndex] = column
        this.props.onChange(board);
    }

    handleDeleteColumn = (button: ButtonType) => {

        if (button !== "Yes") {
            this.setState({ deleteColumn: null });
            return;
        }

        const board: IBoard = this.props.content as IBoard;
        const index = board.columns.findIndex(w => w.id === this.state.deleteColumn?.id);
        board.columns.splice(index, 1);
        board.cards = board.cards.filter(w => w.columnId !== this.state.deleteColumn?.id);
        this.props.onChange(board);
        this.setState({ deleteColumn: null });
    }

    handleDeleteCard = (button: ButtonType) => {

        if (button !== "Yes") {
            this.setState({ deleteCard: null });
            return;
        }

        const board: IBoard = this.props.content as IBoard;
        const index = board.cards.findIndex(w => w.id === this.state.deleteCard?.id);
        board.cards.splice(index, 1);
        this.props.onChange(board);
        this.setState({ deleteCard: null });
    }

    onRegisterRef = (contextMenu: ContextMenu<IColumn> | null, index: number) => {

        if (contextMenu) {
            this.contextMenus[index] = contextMenu;
        }
    }

    onCardRegisterRef = (contextMenu: ContextMenu<ICard> | null, index: number) => {

        if (contextMenu) {
            this.cardContextMenus[index] = contextMenu;
        }
    }

    onDeleteCardHandler = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, card: ICard) => {
        this.setState({
            deleteCard: card
        });
    }

    onEditCardClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, card: ICard) => {
        this.setState({
            addEditCard: card
        });
    }

    onArchiveCardClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, card: ICard) => {
        const board: IBoard = this.props.content as IBoard;
        const index = board.cards.findIndex(w => w.id === card.id);
        board.cards[index].isArchived = true;
        this.props.onChange(board);
    }

    createCardContextMenuItems = (card: ICard) => {
        const contextMenuItems: ContextMenuItem<ICard>[] = [{
            data: card,
            onClick: this.onEditCardClick,
            text: "Edit Card"
        }, {
            data: card,
            onClick: this.onArchiveCardClick,
            text: "Archive Card"
        }, {
            data: card,
            onClick: this.onDeleteCardHandler,
            text: "Delete Card"
        }];

        return contextMenuItems;
    }

    createContextMenuItems = (column: IColumn) => {
        const contextMenuItems: ContextMenuItem<IColumn>[] = [{
            data: column,
            onClick: () => {
                const date = new Date();
                this.setState({
                    addEditCard: {
                        columnId: column.id,
                        content: "",
                        id: 0,
                        name: "",
                        dateAdded: date,
                        dateEdited: date,
                        priority: -1,
                        isArchived: false,
                        comments: [],
                        dueDate: null
                    }
                })
            },
            text: "Add Card"
        }, {
            data: column,
            onClick: () => void (0),
            text: "Rename Column"
        }, {
            data: column,
            onClick: () => this.setState({ deleteColumn: column }),
            text: "Delete Column"
        }];

        return contextMenuItems;
    }

    onAddColumn = (column: IColumn) => {
        const board: IBoard = this.props.content as IBoard;
        const columns = [...board.columns];
        columns.push(column);
        board.columns = columns;
        this.props.onChange(board);
        this.setState({ isAddColumnModalVisible: false });
    }

    onAddEditCard = async (card: ICard) => {
        const board: IBoard = this.props.content as IBoard;
        const cards = [...board.cards ?? []];

        if (card.id <= 0) {
            // add
            card.id = (max(cards.map(w => w.id)) ?? 0) + 1
            
            
            cards.unshift(card);
            board.cards = cards;
        } else {
            const cardIndex = cards.findIndex(w => w.id === card.id);
            board.cards[cardIndex] = { ...card };
        }

        // delete previous notifications?

        this.props.onChange(board);
        this.setState({ addEditCard: null });
    }

    onCardsChange = (cards: ICard[]) => {
        const board: IBoard = this.props.content as IBoard;
        board.cards = cards;
        const sum = cards.filter(w => this.sumColumnIds.includes(w.columnId)).length;
        this.props.onChange(board, sum);
    }

    render() {
        const board = this.props.content as IBoard;
        const columns = [...board.columns ?? []];
        const cards = [...board.cards ?? []];
        const getNextColumnId = () => (max(columns.map(w => w.id)) ?? 0) + 1;
        return <div className="kanban-editor">
            <div className="editor-toolbar">
                <div className="editor-toolbar-row">
                    <div className="editor-toolbar-button-group">
                        <button>
                            <i className="fas fa-plus" onClick={() => this.setState({ isAddColumnModalVisible: true })}></i>
                        </button>
                    </div>
                    <span className="separator"></span>
                    <div className="editor-toolbar-button-group">
                        <button>
                            <i className="fas fa-bars fa-rotate-90"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div className="row search-row">
                <div className="col-sm-8">
                    <input value={this.state.searchText} onChange={e => this.setState({ searchText: e.target.value })} className="form-control" placeholder="Search..." />
                </div>
                <div className="col-sm-4">
                    <label>Show Archived Cards: </label>
                    <input checked={this.state.showArchivedCards} onChange={e => this.setState({ showArchivedCards: e.target.checked })} className="form-control" type="checkbox" />
                </div>
            </div>
            <div className="column-container">
                <SortContainer
                    itemUI={(e, i) => <Column
                        searchText={this.state.searchText}
                        archivedCardsVisible={this.state.showArchivedCards}
                        cards={cards}
                        column={e}
                        key={`column-${i}`}
                        registerRef={this.onRegisterRef}
                        index={i}
                        contextMenuItems={this.createContextMenuItems(e)}
                        cardContextMenuItems={this.createCardContextMenuItems}
                        cardRegisterRef={this.onCardRegisterRef}
                        onChange={this.onCardsChange}
                    />}
                    data={columns}
                    onChange={this.onDragChange}
                />
            </div>
            {this.state.deleteCard != null && <Modal
                buttons={["Yes", "Cancel"]}
                onClick={this.handleDeleteCard}
                title="Delete Card?"
            >
                <p>Are you sure you want to delete the card {this.state.deleteCard.name}?</p>
            </Modal>}
            {this.state.deleteColumn != null && <Modal
                buttons={["Yes", "Cancel"]}
                onClick={this.handleDeleteColumn}
                title="Delete Column?"
            >
                <p>Are you sure you want to delete the column {this.state.deleteColumn.name}?</p>
            </Modal>}
            {this.state.isAddColumnModalVisible && <AddEditColumnModal
                getNextId={getNextColumnId}
                onClose={() => this.setState({ isAddColumnModalVisible: false })}
                onSuccess={this.onAddColumn}
            />}
            {this.state.addEditCard && <AddEditCardModal
                card={this.state.addEditCard}
                onClose={() => this.setState({ addEditCard: null })}
                onSuccess={this.onAddEditCard}
            />}
        </div>
    }
}

export class KanbanEditorContainer implements IEditor {

    stringifySearchContent = (content: IBoard) => {
        const board = content as IBoard;

        return board.cards.map(w => `${w.name} ${w.content}`).join(" ");
    };


    render = (props: EditorProps) => <KanbanEditor {...props} />;

    getDefaultContent = () => {
        return {
            cards: [],
            columns: []
        } as IBoard;
    };

    parse = (page: IPage) => {
        return JSON.parse(page.content);
    }

    stringify = (page: IPageModifyRequest) => {
        return JSON.stringify(page.content);
    }

    type = PageType.Kanban;
    icon = "bi bi-kanban";
    displayName = "Kanban";
}