import { NavigationPanelItem } from "./NavigationPanelItem";

export class NavigationRoot {
    id: string = "";
    title: string = "";
    tabs: NavigationPanelItem[] = [];
    selected?: boolean;
}