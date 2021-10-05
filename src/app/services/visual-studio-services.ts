/// <reference path="../../common-types.d.ts" />

export class VisualStudioService {

    createNuspecFile(path: string): Promise<string> {

        return new Promise(resolve => {

            window.api.receive("create-nuspec", message => {
                resolve(message);
            });

            window.api.send("create-nuspec", path);
        });
    }

    openVisualStudioFileAsAdmin(file: string) {
        // need a settings page or need to auto detect newest VS version
        window.api.send("elevate", ["C:\\Program Files (x86)\\Microsoft Visual Studio\\2019\\Enterprise\\Common7\\IDE\\devenv.exe", file]);
    }

    openVisualStudioCode(pathOrFile: string) {
        // need a settings page or need to auto detect newest VS version
        window.api.send("open-file-vs-code", pathOrFile);
    }
}