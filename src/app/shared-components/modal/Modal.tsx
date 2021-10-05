import * as React from 'react';
import './Modal.scss';

export type ButtonType = "Ok" | "Yes" | "No" | "Cancel" | "Save"

interface Props<T, E> {
    title: string;
    onClick: (button: ButtonType, data?: T) => void;
    buttons: ButtonType[];
    extraData?: E;
    data?: T;
    className?: string;
}

const buttons: { buttonType: ButtonType, className: string }[] = [
    { buttonType: "Ok", className: "btn btn-outline-primary pull-right" },
    { buttonType: "Yes", className: "btn btn-outline-success pull-right" },
    { buttonType: "Save", className: "btn btn-outline-success pull-right" },

    { buttonType: "No", className: "btn btn-outline-default pull-left" },
    { buttonType: "Cancel", className: "btn btn-outline-danger pull-left" }
]

export class Modal<T, E = {}> extends React.Component<Props<T, E>>  {


    render() {
        const classNames = ["modal"];

        if (this.props.className) {
            classNames.push(this.props.className);
        }

        return <div className={classNames.join(' ')} tabIndex={-1}>
            <div className="modal-dialog">
                <div className="modal-content">
                    {!!this.props.title && <div className="modal-header">
                        <h5 className="modal-title">{this.props.title}</h5>
                        <button type="button" className="close" onClick={() => this.props.onClick("Cancel")} data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>}
                    <div className="modal-body">
                        {this.props.children}
                    </div>
                    <div className="modal-footer">
                        {
                            this.props.buttons.map((w, i) => {
                                const button = buttons.find(x => x.buttonType === w)!
                                return <button className={button.className} key={i} onClick={() => this.props.onClick(w, this.props.data)}>{w}</button>
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    }
}