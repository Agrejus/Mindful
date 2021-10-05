import * as path from 'path';
import * as webpack from 'webpack';
import * as CopyWebpackPlugin from 'copy-webpack-plugin';

const config: webpack.Configuration = {

    entry: {
        "server": ["./server/server.ts"]
    },

    target: "node",

    // Set the naming convention of our bundles
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, '../../dist')
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".js", ".json"],
        modules: ['../../server', 'node_modules']
    },

    // Configure our module loaders
    module: {
        rules: [
            {
                test: /\.ts?$/,
                include: path.resolve(__dirname, '../../server'),
                loader: require.resolve("awesome-typescript-loader")
            },

            {
                test: /\.(js|jsx|mjs)$/,
                loader: require.resolve('source-map-loader'),
                enforce: 'pre',
                include: path.resolve(__dirname, '../../server'),
            }
        ]
    },

    // Configure any plugins
    plugins: [
        new CopyWebpackPlugin([
            { from: 'node_modules/better-sqlite3/build/Release', to: "../build/" }
        ])
    ],
    performance: {
        hints: false,
    },
};

export default config;