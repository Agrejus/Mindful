import * as fs from 'fs';
import * as es from 'event-stream';
import * as readline from 'readline';
import { createEmptyFile, getLineData } from './data-store-utils';
import * as lockfile from 'proper-lockfile';

export class FileReaderWriter {

    private index: string;
    private temp: string;
    private lock: string;
    private streamWriter: fs.WriteStream | null = null;
    private timeoutSeconds: number = 10;
    private waitMs: number = 20;
    private activeLineMarker: string = "O:";
    private deletedLineMarker: string = "X:";
    private directory: string;
    private parseResponse:boolean;

    constructor(options: FileReaderWriterOptions) {
        this.index = options.index;
        this.temp = options.temp;
        this.lock = options.lock;
        this.directory = options.directory;
        this.parseResponse = options.parseResponse;
    }

    private acquireLock(lockType: LockType): Promise<void> {

        return new Promise((resolve, reject) => {
            let accumulator = 0;
            const exclusiveLockFileName = this.createLockFileName("exclusive");
            const readonlyLockFileName = this.createLockFileName("readonly");
            const acquireLockFileName = this.createLockFileName(lockType);

            // ensure lock files exist
            if (fs.existsSync(exclusiveLockFileName) === false) {
                createEmptyFile(exclusiveLockFileName);
            }

            if (fs.existsSync(readonlyLockFileName) === false) {
                createEmptyFile(readonlyLockFileName);
            }

            const action = () => {

                // always wait for exclusive locks to be done
                // or if obtaining an exclusive lock, wait for 
                // any lock so we don't mess up reads
                if (lockfile.checkSync(exclusiveLockFileName) || (lockType === "exclusive" && lockfile.checkSync(exclusiveLockFileName))) {

                    if (accumulator >= (this.timeoutSeconds * 1000)) {
                        reject(`Max Timeout Reached - ${this.timeoutSeconds} seconds`);
                        return;
                    }

                    accumulator += this.waitMs;
                    setTimeout(action, this.waitMs);
                    return;
                }

                try {
                    lockfile.lockSync(acquireLockFileName);

                    resolve();
                } catch(e) {
                    accumulator += this.waitMs;
                    setTimeout(action, this.waitMs)
                }
            }

            action();
        });
    }

    private safeDelete(fileNameAndPath: string) {
        if (fs.existsSync(fileNameAndPath)) {
            fs.unlinkSync(fileNameAndPath);
        }
    }

    private createLockFileName(lockType: LockType) {
        return `${this.lock}.${lockType}.lock`
    }

    private releaseLock(lockType: LockType) {

        try {
            const acquireLockFileName = this.createLockFileName(lockType);
            lockfile.unlockSync(acquireLockFileName);
        } catch (e) {
            throw `Error releasing lock.  Message: ${e.message}`;
        }
    }

    private parse(data:string):any  {
        if (this.parseResponse) {
            return JSON.parse(data);
        }
        return data;
    }

    async delete(id: number): Promise<boolean> {
        const lockType: LockType = "exclusive";
        let idAccumulator = 0;

        return new Promise<boolean>(async (resolve, reject) => {
            try {

                if (fs.existsSync(this.index) === false) {
                    reject("Index not found");
                    return;
                }

                await this.acquireLock(lockType);

                if (fs.existsSync(this.temp)) {
                    throw "Temp index not cleaned up properly"
                }
                let result: boolean = false;

                this.streamWriter = fs.createWriteStream(this.temp, { flags: "a" });
                fs.createReadStream(this.index, { flags: "r" }).pipe(es.split()).pipe(es.mapSync((line: string) => {

                    if (!line) {
                        return;
                    }

                    idAccumulator++;

                    if (idAccumulator == id) {
                        this.streamWriter!.write(`${this.deletedLineMarker}\n`);
                    } else {
                        this.streamWriter!.write(`${line}\n`);
                    }

                }).on("error", async (err:any) => {
                    this.safeDelete(this.temp);
                    this.releaseLock(lockType);
                    reject(err);
                }).on("end", async () => {
                    try {
                        if (this.streamWriter != null) {
                            this.streamWriter.end();
                        }

                        this.safeDelete(this.index);

                        if (fs.existsSync(this.temp)) {
                            fs.renameSync(this.temp, this.index);
                        }

                        this.releaseLock(lockType);

                        resolve(result);
                    } catch (e) {
                        reject(e);
                    }
                }));
            } catch (e) {
                this.safeDelete(this.temp);
                this.releaseLock(lockType);
                reject(e);
            }
        })
    }

    async update<T extends ItemBase>(item: T, key:keyof T): Promise<boolean> {
        const lockType: LockType = "exclusive";
        let idAccumulator = 0;

        return new Promise<boolean>(async (resolve, reject) => {
            try {

                if (fs.existsSync(this.index) === false) {
                    reject("Index not found");
                    return;
                }

                await this.acquireLock(lockType);

                if (fs.existsSync(this.temp)) {
                    throw "Temp index not cleaned up properly"
                }
                let result: boolean = false;

                this.streamWriter = fs.createWriteStream(this.temp, { flags: "a" });
                fs.createReadStream(this.index, { flags: "r" }).pipe(es.split()).pipe(es.mapSync((line: string) => {

                    if (!line) {
                        return;
                    }

                    idAccumulator++;

                    if (idAccumulator == (item[key] as any)) {

                        // do not update a deleted line
                        if (line.startsWith(this.deletedLineMarker)) {
                            this.streamWriter!.write(`${line}\n`);
                            return;
                        }

                        const newLine = JSON.stringify(item);
                        this.streamWriter!.write(`${this.activeLineMarker}${newLine}\n`);
                    } else {
                        this.streamWriter!.write(`${line}\n`);
                    }

                }).on("error", async (err:any) => {
                    this.safeDelete(this.temp);
                    this.releaseLock(lockType);
                    reject(err);
                }).on("end", async () => {
                    try {
                        if (this.streamWriter != null) {
                            this.streamWriter.end();
                        }

                        this.safeDelete(this.index);

                        if (fs.existsSync(this.temp)) {
                            fs.renameSync(this.temp, this.index);
                        }

                        this.releaseLock(lockType);

                        resolve(result);
                    } catch (e) {
                        reject(e);
                    }
                }));
            } catch (e) {
                this.safeDelete(this.temp);
                this.releaseLock(lockType);
                reject(e);
            }
        })
    }

    async create<T extends ItemBase>(item: T, key:keyof T): Promise<T | null> {
        const lockType: LockType = "exclusive";
        let idAccumulator = 0;

        return new Promise<T | null>(async (resolve, reject) => {
            try {

                if (fs.existsSync(this.index) === false) {
                    createEmptyFile(this.index);
                }

                await this.acquireLock(lockType);

                if (fs.existsSync(this.temp)) {
                    throw "Temp index not cleaned up properly"
                }

                this.streamWriter = fs.createWriteStream(this.temp, { flags: "a" });

                fs.createReadStream(this.index, { flags: "r" }).pipe(es.split()).pipe(es.mapSync((line: string) => {

                    if (!line) {
                        return;
                    }

                    idAccumulator++;

                    this.streamWriter!.write(`${line}\n`);

                }).on("error", async (err:any) => {
                    this.safeDelete(this.temp);
                    this.releaseLock(lockType);
                    reject(err);
                }).on("end", async () => {
                    try {
                        if (this.streamWriter != null) {

                            (item[key] as any) = ++idAccumulator;

                            const line = JSON.stringify(item);
                            this.streamWriter!.write(`${this.activeLineMarker}${line}\n`);
                            this.streamWriter.end();
                        }

                        this.safeDelete(this.index);

                        if (fs.existsSync(this.temp)) {
                            fs.renameSync(this.temp, this.index);
                        }

                        this.releaseLock(lockType);

                        resolve(item);
                    } catch (e) {
                        reject(e);
                    }
                }));
            } catch (e) {
                this.safeDelete(this.temp);
                this.releaseLock(lockType);
                reject(e);
            }
        })
    }

    async find<T extends ItemBase>(id: number): Promise<T | null> {
        const lockType: LockType = "readonly";

        return new Promise<T | null>(async (resolve, reject) => {
            try {

                if (fs.existsSync(this.index) === false) {
                    reject("Index not found");
                    return;
                }

                await this.acquireLock(lockType);

                const lineReader = readline.createInterface({
                    input: fs.createReadStream(this.index, { flags: "r" })
                });

                let idAccumulator = 0;
                let found: string | null = null;
                for await (const line of lineReader) {

                    if (!line) {
                        continue;
                    }

                    idAccumulator++;

                    if (idAccumulator == id) {
                        found = line;
                        break;
                    }
                }

                let result: T | null = null;
                if (found && found.startsWith(this.deletedLineMarker) == false) {
                    const lineData = getLineData(found)
                    result = this.parse(lineData);
                }

                this.releaseLock(lockType);
                resolve(result);
            } catch (e) {
                this.releaseLock(lockType);
                reject(e);
            }
        })
    }

    async all<T extends ItemBase>() {
        const lockType: LockType = "readonly";

        return new Promise<T[]>(async (resolve, reject) => {
            try {

                if (fs.existsSync(this.index) === false) {
                    reject("Index not found");
                    return;
                }

                const data: T[] = [];
                await this.acquireLock(lockType);

                fs.createReadStream(this.index, { flags: "r" }).pipe(es.split()).pipe(es.mapSync((line: string) => {

                    if (!line) {
                        return;
                    }

                    if (line.startsWith(this.deletedLineMarker)) {
                        return;
                    }

                    const lineData = getLineData(line);
                    data.push(this.parse(lineData))

                }).on("error", async (err:any) => {
                    this.releaseLock(lockType);
                    reject(err);
                }).on("end", async () => {
                    try {
                        this.releaseLock(lockType);

                        resolve(data);
                    } catch (e) {
                        reject(e);
                    }
                }));
            } catch (e) {
                this.releaseLock(lockType);
                reject(e);
            }
        })
    }
}