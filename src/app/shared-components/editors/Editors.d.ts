declare type Action = () => void;

declare interface IDomActionable {
    canIgnore?: (e: MouseEvent) => boolean;
    action: Action;
}

declare interface EditorProps {
    content: any;
    onChange: (content: any, sum?: number) => void;
    registerDomClickActions: (actions: IDomActionable[]) => void;
}