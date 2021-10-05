import * as webpack from 'webpack';
import config from '../webpack.electron.config.common';
import * as merge from 'webpack-merge';
import { DefinePlugin } from 'webpack';
import { devElectronSettings } from './dev.electronsettings.transform';
import { electronSettings } from '../electronSettings';
import { mergeAndTranslateSettings } from '../../../src/Common/configuration/helpers';

export default merge(config, {

    optimization: {
        // We no not want to minimize our code in dev
        minimize: false
    },
    plugins: [
        new DefinePlugin({
            electronSettings: mergeAndTranslateSettings(electronSettings, devElectronSettings)
        })
    ],

    mode: "development",
});