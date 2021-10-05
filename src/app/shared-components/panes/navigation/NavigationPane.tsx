import * as React from 'react';
import { PanelBar, PanelBarItem, PanelBarSelectEventArguments } from '@progress/kendo-react-layout';
import { NavigationRoot } from '../../../../app/models/NavigationRoot';
import { NavigationPanelItem } from '../../../../app/models/NavigationPanelItem';

interface State {
    selected: string;
}

interface Props {
    items: NavigationRoot[];
    onSelect?: (e: PanelBarSelectEventArguments) => void;
}

export class NavigationPane extends React.Component<Props, State> {

    state: State = {
        selected: ""
    };

    componentWillReceiveProps(props: Props) {
        let selected = "";
        for (let i = 0; i < props.items.length; i++) {

            const root = props.items[i];
            if (root.selected === true) {
                selected = `.${i}.0`;
                break;
            }

            for (let j = 0; j < root.tabs.length; j++) {
                const tab = root.tabs[j];

                if (tab.selected === true) {
                    selected = `.${i}.${j}`;
                    break;
                }
            }
        }

        this.setState({
            selected
        });
    }

    renderPanelBarChildren = (items: NavigationPanelItem[]) => {
        return items.map(w => <PanelBarItem {...w} />);
    }

    renderPanelBarRoots = (items: NavigationRoot[]) => {
        return items.map(w => <PanelBarItem {...w}>
            {w.tabs && w.tabs.length > 0 ? this.renderPanelBarChildren(w.tabs) : null}
        </PanelBarItem>);
    }

    render() {
        return <div className="panelbar-wrapper">
            <PanelBar onSelect={this.props.onSelect} selected={this.state.selected}>
                {
                    this.renderPanelBarRoots(this.props.items)
                }
            </PanelBar>
        </div>
    }
}