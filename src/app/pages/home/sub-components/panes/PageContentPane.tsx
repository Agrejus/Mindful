import * as React from 'react';
import { PageType } from '../../../../constants/Constants';
import { HoverExpandButton } from '../../../../shared-components/buttons/HoverExpandButton';
import { getDisplayName } from '../../../../shared-components/editors/Editors';
import { allWidgets, isAllowed } from '../../../../shared-components/widgets/sections/section-widget';
import { AddWidgetModal } from './sub-components/modals/AddWidgetModal';

interface Props {
    title?: string;
    subTitle?: string;
    onWidgetsChange: (widgets: IWidget[]) => void;
    section: ISection | null | undefined;
    pageType: PageType;
}

export const PageContentPane: React.FunctionComponent<Props> = (props) => {

    const [isWdigetModalVisible, setIsWdigetModalVisible] = React.useState(false);

    const onAddWidgetClick = () => {
        setIsWdigetModalVisible(true);
    }

    const areWidgetsAvailable = allWidgets.some(w => isAllowed(w.type, props.pageType));
    const icon = props.section?.widgets != null && props.section.widgets.length > 0 ? "bi bi-app-indicator" : "bi bi-app";
    const pageTitlePrefix = getDisplayName(props.pageType);

    return <div className="page-content-pane">
        {!!props.title && <div className="page-content-pane-title">
            <div className="page-header-actions-container">
                <HoverExpandButton className="text-default" text="share" iconClassName="fas fa-user-plus" />
                {areWidgetsAvailable && <HoverExpandButton onClick={onAddWidgetClick} className="text-default" text="widgets" iconClassName={icon} />}
            </div>
            <h4>{props.title}</h4>
            {!!props.subTitle && <small>{props.subTitle}</small>}
            <hr />
        </div>}
        {props.children}
        {
            isWdigetModalVisible && props.section && <AddWidgetModal
                titlePrefix={pageTitlePrefix}
                onChange={props.onWidgetsChange}
                widgets={props.section.widgets}
                onClose={() => setIsWdigetModalVisible(false)}
            />
        }
    </div>
}