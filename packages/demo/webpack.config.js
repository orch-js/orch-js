const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { createTransformer } = require('@orch/ts-plugin')

const orchTransformer = createTransformer()

module.exports = {
  mode: process.env.NODE_ENV,

  entry: './src/client/index.tsx',

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },

  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist', 'webpack'),
    publicPath: process.env.NODE_ENV === 'production' ? 'http://127.0.0.1:9001/build/' : '',
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              context: __dirname,
              configFile: 'tsconfig.build.json',
              projectReferences: true,
              getCustomTransformers: () => ({ before: [orchTransformer] }),
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, './index.html'),
    }),
  ],

  devServer: {
    historyApiFallback: true,
    compress: true,
    port: 9000,
    proxy: {
      '/resource': 'http://localhost:9001',
    },
  },
}
