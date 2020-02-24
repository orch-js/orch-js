const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: process.env.NODE_ENV,

  entry: './src/client/index.tsx',

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },

  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist', 'webpack'),
    publicPath: process.env.NODE_ENV === 'production' ? '/build/' : '',
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
