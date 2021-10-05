/// <reference path="../../../data/section-repository.d.ts"/>
import * as React from 'react';
import { ButtonType, Modal } from '../../../shared-components/modal/Modal';
import { SketchPicker } from 'react-color';
import './ChangeSectionColorModal.scss';

interface State {
    sectionColor: string;
}

interface Props {
    onClick: (button: ButtonType, color?: string) => void;
    onColorChange: (color: string) => void;
    color: string;
}

export class ChangeSectionColorModal extends React.Component<Props, State> {
    
    constructor(props: Props) {
        super(props);

        this.state = {
            sectionColor: props.color
        }
    }

    onHandleSectionClick = async (button: ButtonType) => {
        if (button === "Ok") {
            this.props.onClick(button, this.state.sectionColor);
            return;
        }

        this.props.onClick(button);
    }

    onChange = (hex: string) => {
        this.props.onColorChange(hex);
        this.setState({ sectionColor: hex })
    }

    render() {
        return <Modal<ISectionModifyRequest>
            buttons={["Ok", "Cancel"]}
            onClick={this.onHandleSectionClick}
            title="Change Section Color">
            <SketchPicker
                color={this.state.sectionColor}
                onChange={e => this.onChange(e.hex)}
                onChangeComplete={e => this.setState({ sectionColor: e.hex })}
            />
        </Modal>
    }
}