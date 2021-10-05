import * as webpack from 'webpack';
import config from '../webpack.config.common';
import * as merge from 'webpack-merge';
import { DefinePlugin } from 'webpack';
import { productionAppSettings } from './prod.appsettings.transform';
import { appSettings } from '../appsettings';
import { mergeAndTranslateSettings } from '../../src/common/configuration/helpers';
import { webpackConcatPlugin } from '../../src/common/configuration/webpack-concat-wrapper';
import * as OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import * as TerserPlugin  from 'terser-webpack-plugin';

export default merge(config, {

    optimization: {
        // We no not want to minimize our code in dev
        minimize: false
    },
    plugins: [
        webpackConcatPlugin({
            // This is the react vendor bundle
            uglify: false,
            sourceMap: true,
            name: 'vendor',
            outputPath: '',
            fileName: '[name].[hash].js',
            filesToConcat: ['./node_modules/react/umd/react.production.min.js', './node_modules/react-dom/umd/react-dom.production.min.js']
        }),
        new DefinePlugin({
            appSettings: mergeAndTranslateSettings(appSettings, productionAppSettings)
        }),
        new OptimizeCSSAssetsPlugin({
            assetNameRegExp: /\.styles\.css$/g,
            cssProcessor: require('cssnano'),
            cssProcessorPluginOptions: {
                preset: ['default', { discardComments: { removeAll: true } }],
            },
            canPrint: true
        }),
        new TerserPlugin({
            parallel: true,
            terserOptions: {
              ecma: 6,
            },
          })
    ],

    mode: "production",
});