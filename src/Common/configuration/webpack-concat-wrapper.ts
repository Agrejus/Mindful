/// <reference path="./interfaces.d.ts" />
import * as webpack from 'webpack';
const ConcatPlugin = require('webpack-concat-plugin'); // must stay a require!

export const webpackConcatPlugin = (value: IWebpackConcatPlugin):webpack.Plugin => {
    const result: webpack.Plugin = new ConcatPlugin(value);
    return result;
}