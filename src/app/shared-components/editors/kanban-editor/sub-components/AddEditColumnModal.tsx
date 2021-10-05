import * as React from 'react';
import { IColumn } from '../Sorting';
import { ButtonType, Modal } from '../../../modal/Modal';

interface AddEditColumnModalProps {
    onClose: () => void;
    onSuccess: (column: IColumn) => void;
    column?: IColumn;
    getNextId: () => number
}

interface AddEditColumnModalState {
    name: string;
}

export class AddEditColumnModal extends React.Component<AddEditColumnModalProps, AddEditColumnModalState> {

    state: AddEditColumnModalState = {
        name: ""
    }

    onClick = (button: ButtonType) => {
        if (button === "Cancel") {
            this.props.onClose();
            return;
        }

        this.props.onSuccess({
            name: this.state.name,
            id: this.props.getNextId()
        });
    }

    render() {
        return <Modal<IColumn>
            buttons={["Ok", "Cancel"]}
            onClick={this.onClick}
            title="Add Column">
            <div className="row">
                <div className="col-sm-12">
                    <label>Name</label>
                    <input type="text" className="form-control" value={this.state.name} onChange={e => this.setState({ name: e.target.value })} />
                </div>
            </div>
        </Modal>
    }
}