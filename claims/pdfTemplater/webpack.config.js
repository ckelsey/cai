const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

module.exports = {
    context: path.resolve(__dirname),
    entry: { "app": path.join(__dirname, 'src/index.js') },
    devServer: {
        compress: true,
        port: 4000,
        https: true
    },
    target: 'web',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: './[name].js',
        umdNamedDefine: true
    },
    plugins: [
        new HtmlWebpackPlugin({ template: 'src/index.html' })
    ],
    mode: 'production',
    optimization: { minimize: true },
    resolve: { extensions: ['*', '.js', '.json', '.html'] },
    module: {
        rules: [{
            test: /\.(scss|css)$/,
            use: [
                'style-loader',
                'css-loader',
                'sass-loader',
            ],
        }, {
            test: /\.(js)$/,
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
            }]
        }, {
            test: /\.(html)$/,
            use: {
                loader: 'html-loader',
                options: {
                    attrs: [':data-src']
                }
            }
        }]
    }
}