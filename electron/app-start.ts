import { exec } from 'child_process';

// const port = process.env.PORT ? (parseInt(process.env.PORT as any) - 100) : 4040;
const port = 4040;
process.env.ELECTRON_START_URL = `http://localhost:${port}`;

console.log("Start URL: " + process.env.ELECTRON_START_URL);

// Start Webpack Dev Server
console.log('starting webpack dev server, waiting for build to complete...');

const logCloseMessage = (e:number, name: string) => {
    console.log(`${name} - Close: ${e}`);
}

const logDataMessage = (e:any, name: string) => {
    console.log(`${name} - sdtout: ${e}`);
}

const logErrorMessage = (e:any, name: string) => {
    console.log(`${name} - Error: ${e}`);
}


const serverCommand = exec('npm run express');
serverCommand.stdout!.on("data", e => logDataMessage(e, "Start Server"));
serverCommand.stderr!.on("data", e => logErrorMessage(e, "Start Server"));
serverCommand.on("error", e => logErrorMessage(e.message, "Start Server"));
serverCommand.on("close", e => logCloseMessage(e, "Start Server"));


const startCommand = exec('npm run start-web');
let isRunning = false;
startCommand.stdout!.on("data", e => {
    console.log(`stdout: ${e}`);

    if (e.includes && (e.includes("Compiled successfully.") || e.includes("Compiled with warnings.")) && isRunning === false) {
        isRunning = true;
        exec('npm run electron');
    }
});

startCommand.stderr!.on("data", e => logErrorMessage(e, "Start Web"));
startCommand.on("error", e => logErrorMessage(e.message, "Start Web"));
startCommand.on("close", e => logCloseMessage(e, "Start Web"));
