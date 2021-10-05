import * as fs from 'fs';

export const createEmptyFile = (fileNameAndPath: string) => {
    fs.closeSync(fs.openSync(fileNameAndPath, 'w'))
}

export const getLineData = (line: string) => {
    return line.substring(2, line.length);
}