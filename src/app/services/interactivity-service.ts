import { FileSystemRepository } from "../data/interactivity-repository";

export class InteractivityService {

    fileSystemRepository: FileSystemRepository;

    constructor(fileSystemRepository: FileSystemRepository) {
        this.fileSystemRepository = fileSystemRepository;
    }

    async getDrives() {
        return await this.fileSystemRepository.getDrives();
    }

    openFile(file: string) {
        window.api.send("open-file", file);
    }

    openFileAsAdmin(file: string) {
        // need a settings page or need to auto detect newest VS version
        window.api.send("elevate", [file]);
    }

    openFilePath(path: string) {
        window.api.send("open-file-path", path);
    }

    getFilesAndFolders(path: string) {
        return this.fileSystemRepository.getFilesAndFolders(path);
    }


    findFilesInFolders(path: string, accept: string) {
        return this.fileSystemRepository.findFilesInFolders(path, accept);
    }

    readFileContents(path: string) {
        return this.fileSystemRepository.readFileContents(path);
    }
}