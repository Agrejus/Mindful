import * as React from 'react';
import { allWidgets, getDefaultValue, getDescription, ISectionWidget, render } from '../../../../../../shared-components/widgets/sections/section-widget';
import { SectionWidgetType } from '../../../../../../constants/Constants';
import './AddWidgetModal.scss';

interface Props {
    allowedWidgets?: ISectionWidget[];
    widgets: IWidget[]
    onChange: (widgets: IWidget[]) => void;
    onClose: () => void;
    titlePrefix: string;
}

interface State {
    widgets: SelectableWidget[];
}

interface SelectableWidget extends IWidget {
    isSelected: boolean;
}

export class AddWidgetModal extends React.Component<Props, State> {

    getWidgets = () => {
        return this.props.allowedWidgets ?? allWidgets;
    }

    state: State = {
        widgets: this.getWidgets().map(w => {

            const widgets = this.props.widgets ?? [];
            const found = widgets.find(x => x.type === w.type);
            const isSelected = found != null;
            const data = found?.data ?? getDefaultValue(w.type);

            return {
                data,
                isSelected,
                type: w.type
            } as SelectableWidget
        })
    };

    getWidgetName = (type: SectionWidgetType) => {
        return this.getWidgets().find(w => w.type === type)?.name;
    }

    onCheckedChange = (index: number, checked: boolean) => {
        const { widgets } = this.state;
        widgets[index].isSelected = checked;
        this.setState({
            widgets: [...widgets]
        })
    }

    onSave = () => {
        const widgets = this.state.widgets.filter(w => w.isSelected === true).map(w => {
            return {
                data: w.data,
                type: w.type
            } as IWidget
        });
        this.props.onChange(widgets);
        this.props.onClose();
    }

    render() {
        return <div className="modal" tabIndex={-1}>
            <div className="modal-dialog add-widget-modal">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{this.props.titlePrefix} Widgets</h5>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={this.props.onClose}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            <div className="col-md-12">
                                {
                                    this.state.widgets.map((w, i) => <div key={`widget-container-${i}`} className="text-center add-widget">
                                        <div className="add-widget-title">
                                            <span>{this.getWidgetName(w.type)}</span>
                                        </div>
                                        <div className="add-widget-body">
                                            {
                                                render(w, i)
                                            }
                                            <small>{getDescription(w.type)}</small>
                                        </div>
                                        <div className="add-widget-footer">
                                            <input type="checkbox" className="form-control" checked={w.isSelected} onChange={e => this.onCheckedChange(i, e.target.checked)} />
                                        </div>
                                    </div>)
                                }
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-danger pull-left" onClick={this.props.onClose}>Cancel</button>
                        <button className="btn btn-outline-success pull-right" onClick={this.onSave}>Save</button>
                    </div>
                </div>
            </div>
        </div>
    }
}