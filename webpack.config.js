const path = require('path')

const CopyPlugin = require("copy-webpack-plugin")
const HtmlWebPackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserJSPlugin = require('terser-webpack-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

module.exports = {
  entry: {
    main: './src/index.ts',
  },
  performance: {
    hints: false,
    maxAssetSize: 300000
  },
  optimization: {
    minimizer: [
      new TerserJSPlugin({
        sourceMap: true,
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(less|css)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: { url: false }
          },
          {
            loader: "less-loader",
            options: {
            },
          },
        ]
      },
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js', '.less', '.css' ],
    plugins: [new TsconfigPathsPlugin()]
  },
  externals: {
    // Libraries for now are included manually
    jquery: 'jQuery',
    "jquery-ui": 'jQuery',
    jqueryui: 'jQuery',
    toastr: 'toastr',
  },
  output: {
    filename: 'js/app.js',
    // Export to /docs so we can leverage Github page hosting.
    path: path.resolve(__dirname, 'docs')
  },
  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional.
      // NOTE: This file cannot be moved to css/ unless the
      // apparatus sprites are moved under css too.
      filename: 'styles.css',
      chunkFilename: '[id].css',
    }),
    new HtmlWebPackPlugin({
      template: "./html/index.htm",
      filename: "./index.htm"
    }),
    // Copy files from the static folder.
    new CopyPlugin([
      {
        context: 'static',
        from: '**/*',
        to: '.',
        // Don't copy Photoshop files, thumbnail files etc.
        ignore: ['Thumbs.db', '*.psd', '*.md'],
      },
    ], {
      copyUnmodified: true
    }),
  ],
  stats: {
    modules: false,
    chunkModules: false,
    moduleTrace: false,
    chunks: false,
    reasons: false,
  }
};