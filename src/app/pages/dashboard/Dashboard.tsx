import { uniq } from 'lodash';
import * as React from 'react';
import { services } from '../../services/services';
import { getDisplayName } from '../../shared-components/editors/Editors';

interface Props {

}

interface State {
    pages: IPage[];
    sections: ISection[];
}

export class Dashboard extends React.PureComponent<Props, State> {

    state : State = {
        pages: [],
        sections: []
    }

    async componentDidMount() {
        const sections = await services.sectionsService.getAll();
        const pages = await services.pagesService.getAll();

        this.setState({
            sections,
            pages
        });
    }

    render() {
        const distinctPageTypeNames = uniq(this.state.pages.map(w => w.pageTypeId));
        return <div>
            <h1>Sections</h1>
            <h1>Pages</h1>
            {
                distinctPageTypeNames.map((w, i) => <div key={w}>{getDisplayName(w)}</div>)
            }
        </div>
    }
}