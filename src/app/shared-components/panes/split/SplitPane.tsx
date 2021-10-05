import * as React from 'react';
import { SplitterPaneProps, Splitter, SplitterOnChangeEvent } from '@progress/kendo-react-layout';

export interface SplitPaneState {
    panes: SplitterPaneProps[]
}

export interface SplitPaneProps {
    orientation: "vertical" | "horizontal",
    panes: SplitterPaneProps[]
}

export class SplitPane<P extends SplitPaneProps, S extends SplitPaneState> extends React.Component<P, S> {

    constructor(props: P) {
        super(props);
        const newState: SplitPaneState = {
            panes: props.panes
        };
        this.state = {...newState} as S
    }

    onChange = (e: SplitterOnChangeEvent) => {
        this.setState({
            panes: e.newState
        });
    }

    render() {
        return <Splitter
            style={{ height: "100%" }}
            panes={this.state.panes}
            orientation={this.props.orientation}
            onChange={this.onChange}
        >
            {
                this.props.children
            }
        </Splitter>
    }
}