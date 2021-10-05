import * as React from 'react';
import { Modal } from '../../../modal/Modal';
import { ILogFile } from '../KuduLogsExplorer';
import * as moment from 'moment';

interface Props {
    onClose: () => void;
    file: ILogFile;
    text: string
}

interface State {
    searchText: string;
}

export class ViewTextModal extends React.PureComponent<Props> {

    render() {
        return <Modal<ILogFile>
            buttons={["Ok"]}
            onClick={this.props.onClose}
            title="Log File">
            <div className="row">
                <div className="col-sm-6">
                    <label>File: </label>{this.props.file.name}
                </div>
                <div className="col-sm-6">
                    <label>Date: </label>{moment(this.props.file.crtime).format("M/D/YYYY h:mm a")}
                </div>
                <div className="col-sm-12">
                    <label>Url: </label>
                    <div>{this.props.file.path}</div>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 text-content">
                    {this.props.text}
                </div>
            </div>
        </Modal>
    }
}