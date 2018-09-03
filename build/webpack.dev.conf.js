const path = require('path');
const webpack = require("webpack");
const merge = require("webpack-merge");
const webpackConfigBase = require('./webpack.base.conf');
const webpackConfigDev = {
    mode: 'development', // 通过 mode 声明开发环境
    output: {
        path: path.resolve(__dirname, '../dist'),
        // 打包多出口文件
        // 生成 a.bundle.[hash].js  b.bundle.[hash].js
        filename: './js/[name].bundle.[hash].js'
    },
    devServer: {
        contentBase: path.join(__dirname, "../dist"),
        publicPath: '/',
        host: "127.0.0.1",
        port: "8089",
        overlay: true, // 浏览器页面上显示错误
        // open: true, // 开启浏览器
        // stats: "errors-only", //stats: "errors-only"表示只打印错误：
        hot: true, // 开启热更新
        proxy: {
            "/v1/gen_suid": {
                target: "https://suid-generator-api-ms.juejin.im",
                changeOrigin: true,
                secure: false
            },
            "/v1/get_recommended_entry": {
                target: "https://recommender-api-ms.juejin.im",
                changeOrigin: true,
                secure: false
            },
            "/v1/get_entry_by_rank": {
                target: "https://timeline-merger-ms.juejin.im",
                changeOrigin: true,
                secure: false
            },
            '/v1/getListByLastTime': {
                target: 'https://xiaoce-timeline-api-ms.juejin.im',
                changeOrigin: true,
                secure: false
            },
            '/v1/web/aanner': {
                target: 'https://banner-storage-ms.juejin.im',
                changeOrigin: true,
                secure: false
            },
            '/v1/categories': {
                target: 'https://gold-tag-ms.juejin.im',
                changeOrigin: true,
                secure: false
            },
            '/v1/topicList': {
                target: 'https://short-msg-ms.juejin.im',
                changeOrigin: true,
                secure: false
            },
            '/v1/web/page': {
                target: 'https://banner-storage-ms.juejin.im',
                changeOrigin: true,
                secure: false
            },
            '/v1/pinList': {
                target: 'https://short-msg-ms.juejin.im',
                changeOrigin: true,
                secure: false
            },
            '/pins': {
                target: 'http://127.0.0.1:8089/',
                pathRewrite: {'^/pins' : '/pins.html'},
                changeOrigin: true,
                secure: false,
            }


        }
    },
    plugins: [
        //热更新
        new webpack.HotModuleReplacementPlugin(),
    ],
    devtool: "source-map",  // 开启调试模式
    module: {
        rules: []
    },
}
module.exports = merge(webpackConfigBase, webpackConfigDev);
