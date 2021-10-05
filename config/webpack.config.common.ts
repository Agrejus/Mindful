import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as path from 'path';
import * as webpack from 'webpack';
import * as CopyWebpackPlugin from 'copy-webpack-plugin';

const config: webpack.Configuration = {

    // Set the entry to the application chunk which points to index.tsx
    entry: {
        app: ["./src/index.tsx"]
    },

    // Set the naming convention of our bundles
    output: {
        globalObject: 'self',
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, '../dist'),
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"],
        modules: ['../src', 'node_modules']
    },

    // Configure our module loaders
    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            {
                test: /\.worker\.(js|ts)$/,
                use: { loader: "worker-loader" },
            },
            {
                test: /\.tsx?$/,
                include: path.resolve(__dirname, '../src'),
                loader: require.resolve("awesome-typescript-loader")
            },

            {
                test: /\.(js|jsx|mjs)$/,
                loader: require.resolve('source-map-loader'),
                enforce: 'pre',
                include: path.resolve(__dirname, '../src'),
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader", 'css-loader'
                ],
            },
            {
                test: /\.scss$/,
                use: [
                    "style-loader", // creates style nodes from JS strings
                    "css-loader", // translates CSS into CommonJS
                    "sass-loader" // compiles Sass to CSS, using Node Sass by default
                ]
            },

            // embed small images and fonts as Data Urls and larger ones as files:
            { test: /\.(png|gif|jpg|cur)$/i, loader: 'url-loader', options: { limit: 8192 } },
            { test: /\.woff2(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff2' } },
            { test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff' } },
            // load these fonts normally, as files:
            { test: /\.(ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'file-loader' }
        ]
    },

    // Configure any plugins
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: './index.html',
        }),
        new webpack.HashedModuleIdsPlugin(),
        new CopyWebpackPlugin([
            { from: 'static/', to: "static/" },
            { from: '*.min.js', to: "static/", context: "node_modules/@fortawesome/fontawesome-free/js/" }
        ]),
        // new MiniCssExtractPlugin({
        //     filename: 'styles.css',
        // }),
    ],

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    },

    // Configure Webpack Dev Server
    devServer: {
        compress: true,
        open: false,
        watchContentBase: true,
        contentBase: [
            path.join(__dirname, '../dist'),
            path.resolve(__dirname, "../node_modules")
        ],
        historyApiFallback: true,
        port: 4040
    },

    // Some libraries import Node modules but don't use them in the browser.
    // Tell Webpack to provide empty mocks for them so importing them works.
    node: {
        dgram: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty',
    },

    // Turn off performance hints during development because we don't do any
    // splitting or minification in interest of speed. These warnings become
    // cumbersome.
    performance: {
        hints: false,
    },
};

export default config;