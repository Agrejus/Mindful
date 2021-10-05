declare namespace NodeJS {
    interface ProcessEnv {
        //PORT: number;
        ELECTRON_START_URL: string;
    }
}

declare module "worker-loader!*" {
    class WebpackWorker extends Worker {
        constructor(options?: WorkerOptions);
    }

    export default WebpackWorker;
}