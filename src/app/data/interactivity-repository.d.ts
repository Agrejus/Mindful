declare type PathInfoType = "directory" | "file"

declare interface IPathInfo {
    name: string;
    type: PathInfoType;
    isTracked: boolean;
    isSelected: boolean;
    parts:string[];
    children: IPathInfo[];
    fullPath: string;
    isVisible: boolean;
}

declare interface IFileSearchResult {
    name: string,
    type: "directory" | "file" | "other",
    fullPath: string;
}