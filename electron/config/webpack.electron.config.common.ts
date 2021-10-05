import * as path from 'path';
import * as webpack from 'webpack';
import * as CopyWebpackPlugin from 'copy-webpack-plugin';

const config: webpack.Configuration = {

    entry: {
        "app-launcher": ["./electron/app-launcher.ts"],
        "app-start": ["./electron/app-start.ts"],
        "pre-load": ["./electron/pre-load.ts"]
    },

    target: "electron-main",

    // Set the naming convention of our bundles
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, '../../dist'),
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".js", ".json"],
        modules: ['../../electron', 'node_modules']
    },

    node: {
        __dirname: false,
    },

    // Configure our module loaders
    module: {
        rules: [

            {
                test: /\.node$/,
                loader: "node-loader",
            },

            {
                test: /\.worker\.(js|ts)$/,
                use: { loader: "worker-loader" },
            },

            {
                test: /\.ts?$/,
                include: path.resolve(__dirname, '../../electron'),
                loader: require.resolve("awesome-typescript-loader")
            },

            {
                test: /\.(js|jsx|mjs)$/,
                loader: require.resolve('source-map-loader'),
                enforce: 'pre',
                include: path.resolve(__dirname, '../../electron'),
            }
        ]
    },

    // Configure any plugins
    plugins: [
        new CopyWebpackPlugin([
            { from: 'node_modules/keytar/build/Release', to: "scripts/" },
            { from: 'node_modules/icon-extractor/lib/IconExtractor.exe', to: "" }
        ])
    ],

    performance: {
        hints: false,
    },
};

export default config;