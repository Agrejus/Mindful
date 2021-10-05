import * as webpack from 'webpack';
import config from '../webpack.server.config.common';
import * as merge from 'webpack-merge';

export default merge(config, {

    optimization: {
        // We no not want to minimize our code in dev
        minimize: false
    },
    plugins: [

    ],

    mode: "production",
});