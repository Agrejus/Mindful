import { TabItem } from "./TabItem";

export class NavigationPanelItem extends TabItem {
    title: string = "";
    onClose?: (item: NavigationPanelItem) => void = () => void (0);
    onSelect: (item: NavigationPanelItem) => void= () => void (0);
    view: React.ReactNode = null;
}