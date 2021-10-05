const dialog = require('file-dialog');

interface IFileDialogOptions {
    accept: string[] | string;
    multiple?: boolean;
}

type IFileDialog = (options?: IFileDialogOptions) => Promise<File[]>;

export const fileDialog: IFileDialog = dialog;