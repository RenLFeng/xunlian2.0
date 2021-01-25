//
// const proxy = require('http-proxy-middleware');
//
// const CompressionWebpackPlugin = require('compression-webpack-plugin');
//
// const productionGzipExtensions = ['js', 'css'];
//
const isProduction = process.env.NODE_ENV === 'production';
// 代码压缩
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    publicPath: '',
    outputDir:'xunlian_dist',
    pages: {
        dotingxie: {
            entry: 'src/main.js',
            template: 'public/dotingxie.html',
            filename: 'dotingxie.html',
            chunks: ['chunk-vendors', 'chunk-common', 'dotingxie']
        },
        dokouyu:'src/kouyu.js',
        dofaying:'src/faying.js',
        dopeiying:'src/peiying.js'
    },
    chainWebpack: config => {
        if (isProduction) {
            // 删除预加载
            config.plugins.delete('preload');
            config.plugins.delete('prefetch');
            // 压缩代码
            config.optimization.minimize(true);
            // 分割代码
            // config.optimization.splitChunks({
            //     chunks: 'all'
            // })
        };
    },
    configureWebpack: config => {
        // if (isProduction) {
        //     // 代码压缩
        //     config.plugins.push(
        //         new UglifyJsPlugin({
        //             uglifyOptions: {
        //                 output:{
        //                     comments:false
        //                 },
        //                 //生产环境自动删除console
        //                 compress: {
        //                     // warnings: false, // 若打包错误，则注释这行
        //                     drop_debugger: true,
        //                     drop_console: true,
        //                     pure_funcs: ['console.log']
        //                 }
        //             },
        //             sourceMap: false,
        //             parallel: true
        //         })
        //     )
        //        console.log( 'str'.replace(/<.*?>/g,''));
        // };
        // if (isProduction) {

        //     config.plugins.push(new CompressionWebpackPlugin({

        //         algorithm: 'gzip',

        //         test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),

        //         threshold: 10240,

        //         minRatio: 0.8

        //     }))

        // };
    },


    lintOnSave: false,
    devServer: {
        port:8080,
         //  proxy: 'http://192.168.0.2:9982'
        //  proxy: 'http://192.168.40.104:9982'
        proxy:'http://192.168.1.133:9982'
        //proxy: 'https://www2.exsoft.com.cn'
        // proxy:{
        //     '/api': {
        //         target: 'https://www2.exsoft.com.cn',//代理地址，这里设置的地址会代替axios中设置的baseURL
        //         changeOrigin: true,// 如果接口跨域，需要进行这个参数配置
        //         //ws: true, // proxy websockets
        //         //pathRewrite方法重写url
        //     }
        // }
    }
}