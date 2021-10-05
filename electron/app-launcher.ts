/// <reference path="../common-types.d.ts"/>
import * as electron from 'electron';
import * as url from 'url';
import * as path from 'path';
import * as authService from './auth-service';
import { exec } from 'child_process';
const elevator = require('elevator');
const log = require('simple-node-logger').createSimpleFileLogger('mindful.log');

// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: electron.BrowserWindow | null;
const mainAppFile = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../dist/index.html'),
    protocol: 'file:',
    slashes: true
});
const loginUrl = authService.getAuthenticationURL();

async function requiresLogin() {
    try {
        await authService.refreshTokens();
        return false;
    } catch (err) {
        return true;
    }
}

log.info(`App running: ${mainAppFile}`);

//https://auth0.com/blog/securing-electron-applications-with-openid-connect-and-oauth-2/
async function createAppWindow() {

    if (process.platform === 'win32') {
        app.setAppUserModelId("Mindful");
    }

    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        icon: path.join(__dirname, '../static/favicon.ico'),
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            enableRemoteModule: true,
            contextIsolation: true,
            preload: path.join(__dirname, './pre-load.js')
        },
    });

    mainWindow.webContents.toggleDevTools();

    const mustLogin = await requiresLogin();
    const url = mustLogin ? loginUrl : mainAppFile;

    if (mustLogin) {
        mainWindow.loadURL(url);
    } else {
        await mainWindow.loadURL(url);
        const profile = authService.getProfile();
        mainWindow.webContents.send("profile", profile);
    }

    const { session: { webRequest } } = mainWindow.webContents;

    const filter = {
        urls: [
            'http://localhost/callback*'
        ]
    };

    webRequest.onBeforeRequest(filter, async ({ url }) => {

        if (url.includes('callback')) {
            await authService.loadTokens(url);

            if (mainWindow) {
                mainWindow.loadURL(mainAppFile);
            }
        }

    });

    mainWindow.on("ready-to-show", () => {
        if (mainWindow) {
            // send over the profile when the main window is ready, 
            // this will also handle refreshing
            const profile = authService.getProfile();
            mainWindow.webContents.send("profile", profile);
        }
    });

    mainWindow.on("closed", () => {
        mainWindow = null;
    });

    /// API Actions
    electron.ipcMain.on("open-file", async (e, args) => {
        log.info(`open-file - Args: ${JSON.stringify(args || {})}`);
        electron.shell.openExternal(args);
    });

    electron.ipcMain.on("notification", async (e, args: { title: string, body: string }) => {
        const notification = new electron.Notification({ ...args, icon: path.join(__dirname, '../static/favicon.ico') });
        notification.show();
    });

    electron.ipcMain.on("open-file-vs-code", async (e, args) => {
        const command = `code "${args}"`;
        log.info(`pack-nuspec - Args: ${command}`);

        exec(command);
    });

    electron.ipcMain.on("elevate", async (e, args: string[]) => {
        log.info(`elevate - Args: ${JSON.stringify(args || {})}`);
        // open as admin: https://www.npmjs.com/package/@peterupton/elevator
        //electron.shell.openExternal(args.file);

        elevator.execute(args, {
            waitForTermination: false
        }, function (error: any, stdout: any, stderr: any) {
            if (error) {
                log.info(error);
                return;
            }
            log.info(stdout);
            log.info(stderr);
        });
    });

    electron.ipcMain.on("open-file-path", async (e, args) => {
        log.info(`open-file-path - Args: ${JSON.stringify(args || {})}`);
        electron.shell.openPath(args);
    });

    electron.ipcMain.on("pack-nuspec", async (e, args) => {
        const command = `nuget pack ${args}`;
        log.info(`pack-nuspec - Args: ${command}`);

        exec(command, (error, stdout, stderr) => {

            if (!mainWindow) {
                return;
            }

            if (error) {
                mainWindow.webContents.send("pack-nuspec", error.message);
                return;
            }
            if (stderr) {
                mainWindow.webContents.send("pack-nuspec", stderr);
                return;
            }

            mainWindow.webContents.send("pack-nuspec", stdout);
        });
    });

    electron.ipcMain.on("publish-nuspec", async (e, args: { nupkg: string, key: string, source: string }) => {
        const command = `nuget publish ${args.nupkg} ${args.key} -Source ${args.source}`;
        log.info(`publish-nuspec - Args: ${command}`);

        exec(command, (error, stdout, stderr) => {

            if (!mainWindow) {
                return;
            }

            if (error) {
                mainWindow.webContents.send("publish-nuspec", error.message);
                return;
            }
            if (stderr) {
                mainWindow.webContents.send("publish-nuspec", stderr);
                return;
            }

            mainWindow.webContents.send("publish-nuspec", stdout);
        });
    });

    electron.ipcMain.on("create-nuspec", async (e, args) => {
        const command = `nuget spec ${args}`;
        log.info(`create-nuspec - Args: ${command}`);

        exec(command, (error, stdout, stderr) => {

            if (!mainWindow) {
                return;
            }

            if (error) {
                mainWindow.webContents.send("create-nuspec", error.message);
                return;
            }
            if (stderr) {
                mainWindow.webContents.send("create-nuspec", stderr);
                return;
            }

            mainWindow.webContents.send("create-nuspec", stdout);
        });
    });

    electron.ipcMain.on("logout", async (e, args) => {

        if (mainWindow == null) {
            return;
        }

        await mainWindow.loadURL(authService.getLogOutUrl());
        await authService.logout();

        mainWindow.loadURL(authService.getAuthenticationURL());
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createAppWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createAppWindow();
    }
});