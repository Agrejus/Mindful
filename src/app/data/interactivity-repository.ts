/// <reference path="../../common-types.d.ts"/>
import * as path from 'path';

export class FileSystemRepository {

    async getDrives() {
        return await window.api.interactivity().getDiskInfo();
    }

    getFilesAndFolders(directoryPath: string) {
        const getType = (stats: IPartialStat) => {
            if (stats.isDirectory) {
                return "directory";
            }

            if (stats.isFile) {
                return "file";
            }

            return "other";
        }
        const fs = window.api.interactivity().fs;
        const items = fs.readdirSync(directoryPath);
        const getStat = window.api.interactivity().getStat;

        return items.map(w => {
            try {
                const fullPath = path.join(directoryPath, w);
                const stats = getStat(fullPath);

                return {
                    name: w,
                    type: getType(stats),
                    fullPath
                } as IFileSearchResult
            } catch {
                return null;
            }

        }).filter(w => w != null) as IFileSearchResult[];
    }

    readFileContents(file: string) {
        const fs = window.api.interactivity().fs;
        return fs.readFileSync(file, 'utf8');
    }

    findFilesInFolders(directoryPath: string, accept: string) {
        const foldersToScan = [directoryPath];
        const result: string[] = [];

        for (let i = 0; i < foldersToScan.length; i++) {
            const path = foldersToScan[i]
            const items = this.getFilesAndFolders(path);

            for (let item of items) {
                if (item?.type === "directory") {
                    foldersToScan.push(item.fullPath);
                    continue;
                }

                if (item?.type === "file" && item.name.endsWith(accept)) {
                    result.push(item.fullPath);
                }
            }
        }

        return result;
    }
}

