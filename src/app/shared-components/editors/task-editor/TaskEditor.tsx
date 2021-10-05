import './TaskEditor.scss';
import * as React from 'react';
import { PageType } from '../../../constants/Constants';
import { IEditor } from '../Editors';
import { ButtonType, Modal } from '../../modal/Modal';
import DatePicker from "react-datepicker";
import { max } from 'lodash';
import FullCalendar, { EventApi, DateSelectArg, EventClickArg, EventContentArg, formatDate, EventRefiners } from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import * as moment from 'moment';

interface State {
    addEditTask: ITask | null;
    deleteTask: ITask | null;
}

export interface ITask {
    id?: number;
    title: string;
    dueDate: string | null;
    content: string;
    reminders: number[];
    isReoccuring: boolean;
}

export interface ITaskContainer {
    tasks: ITask[]
}

class TasksEditor extends React.PureComponent<EditorProps, State> {

    state: State = {
        addEditTask: null,
        deleteTask: null
    }
    currentEvents: EventApi[] = [];

    calendar: FullCalendar | null = null;

    componentDidMount() {
        this.calendar?.getApi().updateSize();
    }

    onAddTaskClick = () => {
        this.setState({
            addEditTask: {
                title: "",
                content: "",
                dueDate: null,
                isReoccuring: false,
                reminders: []
            }
        });
    }

    getNextId = () => {
        const container = this.props.content as ITaskContainer;
        return (max(container.tasks.map(w => w.id)) ?? 0) + 1;
    }

    onSaveTask = (task: ITask) => {

        const container = this.props.content as ITaskContainer;

        if (!task.id) {
            task.id = this.getNextId();
            container.tasks.push(task);
        } else {
            const index = container.tasks.findIndex(w => w.id == task.id);

            container.tasks[index] = task;
        }

        this.props.onChange(container);

        this.setState({ addEditTask: null });
    }

    handleDeleteTask = (button: ButtonType, task: ITask | undefined) => {

        if (button != "Yes") {
            this.setState({ deleteTask: null });
            return;
        }

        const container = this.props.content as ITaskContainer;
        const index = container.tasks.findIndex(w => w.id == task?.id);

        if (index === -1) {
            this.setState({ deleteTask: null });
            return;
        }

        container.tasks.splice(index, 1);
        this.props.onChange(container);
        this.setState({ deleteTask: null });
    }

    handleEvents = (events: EventApi[]) => {
        this.currentEvents = events;
    }

    handleDateSelect = (selectInfo: DateSelectArg) => {
        const title = prompt('Please enter a new title for your event');
        const calendarApi = selectInfo.view.calendar;

        calendarApi.unselect(); // clear date selection

        if (title) {
            calendarApi.addEvent({
                id: "test",
                title,
                start: selectInfo.startStr,
                end: selectInfo.endStr,
                allDay: selectInfo.allDay
            });
        }
    }

    renderEventContent = (eventContent: EventContentArg) => {
        return (
            <>
                <b>{eventContent.timeText}</b>
                <i>{eventContent.event.title}</i>
            </>
        )
    }

    handleEventClick = (clickInfo: EventClickArg) => {
        const id = clickInfo.event.id as any;;
        const container = this.props.content as ITaskContainer;
        const task = container.tasks.find(w => w.id == id);

        if (!task) {
            return;
        }

        this.setState({
            addEditTask: task
        });
    }

    render() {

        // extendedProps: Identity<Record<string, any>>;
        // start: Identity<DateInput>;
        // end: Identity<DateInput>;
        // date: Identity<DateInput>;
        // allDay: BooleanConstructor;
        // id: StringConstructor;
        // groupId: StringConstructor;
        // title: StringConstructor;
        // url: StringConstructor;

        const container = this.props.content as ITaskContainer;
        const events: any[] = container.tasks.map((w, i) => {
            return {
                title: w.title,
                start: '2021-04-12T10:30:00',
                end: '2021-04-12T11:30:00',
                extendedProps: {
                    department: 'BioChemistry'
                },
                description: 'Lecture',
                id: w.id
            } as any;
        });

        return <div className="tasks-container">
            <div className="editor-toolbar">
                <div className="editor-toolbar-row">
                    <div className="editor-toolbar-button-group">
                        <button onClick={this.onAddTaskClick}>
                            <i className="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div className="tasks-list">
                <div className="link-list-filter-container">
                    <div>
                        <input className="form-control" placeholder="search..." />
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <FullCalendar
                            ref={e => this.calendar = e}
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay'
                            }}
                            initialView='dayGridMonth'
                            editable={true}
                            selectable={true}
                            selectMirror={true}
                            dayMaxEvents={true}
                            weekends={true}
                            initialEvents={events} // alternatively, use the `events` setting to fetch from a feed
                            select={this.handleDateSelect}
                            eventContent={this.renderEventContent} // custom render function
                            eventClick={this.handleEventClick}
                            eventsSet={this.handleEvents} // called after events are initialized/added/changed/removed
                        />
                    </div>
                </div>
            </div>
            {this.state.addEditTask && <AddEditTaskModal
                onClose={() => this.setState({ addEditTask: null })}
                onSuccess={this.onSaveTask}
                task={this.state.addEditTask}
            />}
            {this.state.deleteTask != null && <Modal<ITask>
                buttons={["Yes", "Cancel"]}
                onClick={this.handleDeleteTask}
                title="Delete Task?"
                data={this.state.deleteTask}
            >
                <p>Are you sure you want to delete {this.state.deleteTask.title}?</p>
            </Modal>}
        </div>
    }
}

interface AddLinkTaskProps {
    onClose: () => void;
    onSuccess: (task: ITask) => void;
    task: ITask;
}

interface AddLinkTaskState {
    title: string;
    dueDate: string | null;
    content: string;
    reminders: number[];
    isReoccuring: boolean;
}

class AddEditTaskModal extends React.PureComponent<AddLinkTaskProps, AddLinkTaskState> {

    state: AddLinkTaskState = {
        title: this.props.task?.title ?? "",
        dueDate: this.props.task?.dueDate ?? null,
        content: this.props.task?.content ?? "",
        reminders: this.props.task?.reminders ?? [],
        isReoccuring: this.props.task?.isReoccuring ?? false
    }

    reminders: { title: string, value: number }[] = [
        { title: "5 minutes", value: 5 },
        { title: "10 minutes", value: 10 },
        { title: "15 minutes", value: 15 },
        { title: "30 minutes", value: 30 },
        { title: "1 hour", value: 60 },
        { title: "2 hour", value: 120 },
        { title: "1 day", value: 1440 }
    ];

    onClick = (button: ButtonType) => {
        if (button === "Cancel") {
            this.props.onClose();
            return;
        }

        this.props.onSuccess({
            id: this.props.task.id,
            content: this.state.content,
            dueDate: this.state.dueDate,
            isReoccuring: this.state.isReoccuring,
            reminders: this.state.reminders,
            title: this.state.title
        });
    }

    render() {
        const dueDate = !this.state.dueDate ? null : new Date(this.state.dueDate);
        return <Modal<ITask, string[]>
            buttons={["Ok", "Cancel"]}
            onClick={this.onClick}
            title="">
            <div className="row">
                <div className="col-sm-12">
                    <label>Title</label>
                    <input type="text" className="form-control" value={this.state.title} onChange={e => this.setState({ title: e.target.value })} />
                </div>
            </div>
            <div className="row">
                <div className="col-sm-4">
                    <label className="full-width">Due Date <small>(optional)</small></label>
                    <DatePicker
                        dateFormat="MMMM d, yyyy h:mm aa"
                        timeIntervals={15}
                        showTimeSelect={true}
                        selected={dueDate}
                        onChange={(e: Date | null) => this.setState({ dueDate: moment(e).format() })}
                    />
                </div>
                <div className="col-sm-4">
                    <label className="full-width">Reminder <small>(optional)</small></label>
                    <select className="form-control">
                        {this.reminders.map((w, i) => <option key={`reminder-${i}`} value={w.value}>{w.title}</option>)}
                    </select>
                </div>
                <div className="col-sm-4">
                    <label className="full-width">Reoccurance <small>(optional)</small></label>
                    <input type="checkbox" className="form-control" checked={this.state.isReoccuring} onChange={e => this.setState({ isReoccuring: e.target.checked })} />
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    <label className="full-width">Content</label>
                    <textarea className="form-control" value={this.state.content} onChange={e => this.setState({ content: e.target.value })} />
                </div>
            </div>
        </Modal>
    }
}

export class TaskEditorContainer implements IEditor {

    stringifySearchContent = (content: ITaskContainer) => {
        return content.tasks.map(w => `${w.content} ${w.title}`).join(" ");
    };

    render = (props: EditorProps) => <TasksEditor {...props} />;

    getDefaultContent = () => { return { tasks: [] } as ITaskContainer; };

    parse = (page: IPage) => {
        return JSON.parse(page.content);
    }

    stringify = (page: IPageModifyRequest) => {
        return JSON.stringify(page.content);
    }

    type = PageType.Tasks;
    icon = "fas fa-tasks";
    displayName = "Tasks";
}