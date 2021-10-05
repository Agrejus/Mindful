/// <reference path="./config/electronSettings.d.ts"/>

declare var electronSettings:IElectronSettings;
declare interface IStatusWorker {
    status: "running" | "idle",
    worker: Worker;
    id:number;
}