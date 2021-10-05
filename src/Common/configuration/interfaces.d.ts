declare interface IWebpackConcatPlugin {
    uglify?: boolean;
    sourceMap?: boolean;
    name: string;
    outputPath: string;
    fileName: string;
    filesToConcat: string[];
}