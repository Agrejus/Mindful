/// <reference path="../src/app/data/data.d.ts"/>
/// <reference path="../src/common-types.d.ts"/>
/// <reference path="./common-types.d.ts"/>
import * as nodeDiskInfo from 'node-disk-info';
const { contextBridge, ipcRenderer } = require("electron");
const fs = require('fs');
import { getIcon } from 'icon-extractor'

// https://github.com/electron/electron/issues/9920#issuecomment-575839738
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const channelWhiteList: string[] = ["notification", "logout", "profile", "open-file", "open-file-path", "create-nuspec", "pack-nuspec", "publish-nuspec", "elevate", "open-file-vs-code"];

contextBridge.exposeInMainWorld("api", {
    send: (channel: string, data: any) => {
        // whitelist channels
        if (channelWhiteList.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    receive: (channel: string, func: (...args: any) => void) => {
        if (channelWhiteList.includes(channel)) {
            // Deliberately strip event as it includes `sender` 
            ipcRenderer.on(channel, (event: any, ...args: any[]) => func(...args));
        }
    },
    interactivity: () => {
        return {
            fs: fs,
            getIcon: async (path: string) => {
                return await getIcon(path);
            },
            getStat: (path: string) => {
                const stat = fs.statSync(path);
                return {
                    isFile: stat.isFile(),
                    isDirectory: stat.isDirectory()
                }
            },
            getDiskInfo: async () => {
                const result = await nodeDiskInfo.getDiskInfo();

                return result.map(w => {
                    return {
                        available: w.available,
                        blocks: w.blocks,
                        capacity: w.capacity,
                        filesystem: w.filesystem,
                        mounted: w.mounted,
                        used: w.used
                    }
                })
            }
        }
    }
});
