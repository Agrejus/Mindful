import * as React from 'react';
import { ICard, IComment } from '../Sorting';
import { ButtonType, Modal } from '../../../modal/Modal';
import * as moment from 'moment';
import { max, orderBy } from 'lodash';
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";

interface AddEditCardModalProps {
    onClose: () => void;
    onSuccess: (card: ICard) => void;
    card: ICard;
}

interface AddEditCardModalState {
    content: string;
    name: string;
    priority: number | null;
    comment: string;
    comments: IComment[];
    dueDate: string | null;
}

export class AddEditCardModal extends React.Component<AddEditCardModalProps, AddEditCardModalState> {

    state: AddEditCardModalState = {
        comment: "",
        comments: this.props.card.comments || [],
        content: this.props.card.content,
        name: this.props.card.name,
        priority: this.props.card.priority,
        dueDate: this.props.card.dueDate
    }

    onClick = (button: ButtonType) => {
        if (button === "Cancel") {
            this.props.onClose();
            return;
        }

        this.props.onSuccess({
            name: this.state.name,
            id: this.props.card.id,
            content: this.state.content,
            columnId: this.props.card.columnId,
            dateAdded: this.props.card.dateAdded,
            dateEdited: new Date(),
            priority: this.state.priority,
            isArchived: this.props.card.isArchived,
            comments: this.state.comments,
            dueDate: this.state.dueDate
        });
    }

    onAddCommentClick = () => {

        if (!this.state.comment) {
            return;
        }

        const comments = [...this.state.comments];
        const nextId = (max(comments.map(w => w.commentId)) ?? 0) + 1;
        comments.push({
            commentId: nextId,
            date: new Date(),
            text: this.state.comment
        });

        this.setState({
            comments,
            comment: ""
        });

    }

    onRemoveCommentClick = (commentId: number) => {
        const index = this.state.comments.findIndex(w => w.commentId == commentId);

        if (index === -1) {
            return;
        }

        const comments = [...this.state.comments];

        comments.splice(index, 1);

        this.setState({
            comments
        });
    }

    render() {
        return <Modal<ICard>
            buttons={["Save", "Cancel"]}
            onClick={this.onClick}
            title="Add Card">
            <div className="row">
                <div className="col-sm-9">
                    <label>Title</label>
                    <input type="text" className="form-control" value={this.state.name} onChange={e => this.setState({ name: e.target.value })} />
                </div>
                <div className="col-sm-3">
                    <label>Priority</label>
                    <input type="number" className="form-control" value={this.state.priority ?? ""} onChange={e => this.setState({ priority: e.target.value as any })} />
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    <label>Content</label>
                    <textarea className="form-control" value={this.state.content} onChange={e => this.setState({ content: e.target.value })} />
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 ">
                    <label>Due Date</label>
                    <DatePicker
                        dateFormat="MMMM d, yyyy h:mm aa"
                        timeIntervals={15}
                        showTimeSelect={true}
                        selected={!!this.state.dueDate ? new Date(this.state.dueDate) : null}
                        onChange={(e: Date | null) => this.setState({ dueDate: moment(e).format("MM/DD/YYYY h:mm a") })}
                    />
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 comments-section">
                    <label>Comments</label>
                    <textarea className="form-control" value={this.state.comment} onChange={e => this.setState({ comment: e.target.value })} />
                    <button disabled={!this.state.comment} onClick={this.onAddCommentClick} className="btn btn-outline-primary">Add Comment</button>
                    {this.state.comments && this.state.comments.length > 0 && <ul>
                        {orderBy(this.state.comments, w => w.commentId, "desc").map((w, i) => <li key={`kanban-card-comment-${i}`}><strong>{moment(w.date).format(appSettings.defaultLongDateFormat)}:</strong> {w.text}&emsp;<i onClick={() => this.onRemoveCommentClick(w.commentId)} className="bi bi-trash clickable text-danger"></i></li>)}
                    </ul>}
                </div>
            </div>
        </Modal>
    }
}