/// <reference path="../../../data/section-repository.d.ts"/>
import { convertFromRaw, convertToRaw, EditorState } from 'draft-js';
import * as React from 'react';
import { ButtonType, Modal } from '../../../shared-components/modal/Modal';
import DatePicker from 'react-datepicker';
import './ReminderModal.scss';
import * as moment from 'moment';

interface State {
    editorState: EditorState;
}

interface Props {
    reminder: IReminder;
    onChange: (reminder: IReminder) => void;
    onClick: (button: ButtonType) => void;
}

export class ReminderModal extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        let editorState = EditorState.createEmpty();
        if (!!props.reminder.content) {

            const data = JSON.parse(props.reminder.content);
            editorState = EditorState.createWithContent(convertFromRaw(data));
        }

        this.state = {
            editorState
        }
    }

    onRichTextChange = async (editorState: EditorState) => {
        const { reminder } = this.props;
        this.setState({
            editorState
        });

        const raw = convertToRaw(editorState.getCurrentContent());
        const content = JSON.stringify(raw);
        this.props.onChange({
            ...reminder,
            content
        });
    }

    onNameChange = (value: string) => {
        const { reminder } = this.props;
        this.props.onChange({
            ...reminder,
            reminderName: value
        });
    }

    onDateChange = (date: Date | [Date, Date] | null) => {
        const { reminder } = this.props;
        if (!date) {
            this.props.onChange({
                ...reminder,
                dueDate: ""
            })
            return;
        }

        const dueDate = moment(date as Date).format();
        this.props.onChange({
            ...reminder,
            dueDate
        });
    }

    onCompletedChange = (value:boolean) => {
        const { reminder } = this.props;
        this.props.onChange({
            ...reminder,
            isCompleted: value
        });
    }

    render() {
        let dueDate: Date | null = null;

        if (this.props.reminder.dueDate) {
            dueDate = new Date(this.props.reminder.dueDate);
        }

        return <Modal<IReminder>
            buttons={["Ok", "Cancel"]}
            onClick={this.props.onClick}
            title="">
            <div className="row">
                <div className="col-sm-7">
                    <label>Name</label>
                    <input type="text" className="form-control" value={this.props.reminder.reminderName} onChange={e => this.onNameChange(e.target.value)}/>
                </div>
                <div className="col-sm-5">
                    <label>Date</label>
                    <DatePicker
                        selected={dueDate}
                        onChange={this.onDateChange}
                        showTimeSelect
                        excludeTimes={[]}
                        dateFormat="MMMM d, yyyy h:mm aa"
                        placeholderText="Choose a date..."
                    />
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 checkbox-col">
                    <label>Completed</label><input type="checkbox" className="form-control" onChange={e => this.onCompletedChange(e.target.checked)} checked={this.props.reminder.isCompleted}/>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    {/* <RichTextEditor editorState={this.state.editorState} onChange={this.onRichTextChange} /> */}
                </div>
            </div>
        </Modal>
    }
}