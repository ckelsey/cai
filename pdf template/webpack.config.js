const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

module.exports = {
    entry: {
        "app": path.join(__dirname, 'src/index.js')
    },
    devServer: {
        compress: true,
        port: 4000,
        https: true
    },
    target: 'web',
    output: {
        path: path.join(__dirname, 'dist'),
        // publicPath: './',
        filename: './[name].js'
        // publicPath: __dirname,
        // path: path.join(__dirname,'dist'),
        // filename: "[name].js",
        // libraryExport: 'umd'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        })
    ],
    mode: 'production',
    module: {
        rules: [{
            test: /\.(scss|css)$/,
            use: [
                'css-loader'
            ]
        }, {
            test: /\.(js)$/,
            use: [
                {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            ]
        }, {
            test: /\.(html)$/,
            use: {
                loader: 'html-loader',
                options: {
                    attrs: [':data-src']
                }
            }
        // }, {
        //     test: /\.(eot|svg|ttf|woff|woff2)$/,
        //     loader: 'file-loader',
        //     options: {
        //         name: '[name].[ext]',
        //         outputPath: 'fonts/'
        //     }
        }]
    }
}
