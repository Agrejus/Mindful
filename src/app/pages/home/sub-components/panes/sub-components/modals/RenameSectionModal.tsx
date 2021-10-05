/// <reference path="../../../../../../data/section-repository.d.ts"/>
import * as React from 'react';
import './AddWidgetModal.scss';

interface Props {
    section: ISection;
    onClose: () => void;
    onSave: (section: ISection) => void;
}

interface State {
    sectionName: string;
}

export class RenameSectionModal extends React.Component<Props, State> {

    state: State = {
        sectionName: this.props.section.sectionName
    };

    onSave = () => {
        this.props.onSave({
            ...this.props.section,
            sectionName: this.state.sectionName
        });
        this.props.onClose();
    }

    render() {
        return <div className="modal" tabIndex={-1}>
            <div className="modal-dialog add-widget-modal">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Rename Section</h5>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={this.props.onClose}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            <div className="col-md-12">
                                <label className="full-width">Section Name:</label>
                                <input className="form-control" type="text" value={this.state.sectionName} onChange={e => this.setState({ sectionName: e.target.value })} />
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