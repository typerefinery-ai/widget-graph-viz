const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MergeIntoSingleFilePlugin = require('webpack-merge-and-include-globally');
const fs = require('fs');

const paths = require('./webpack._paths')

const htmlBodyContent = fs.readFileSync(paths.src + '/html/content.html').toString();


const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')


//load package.json
const config = require('./package');

module.exports = {
  // Where webpack looks to start building the bundle
  entry: [
    paths.src + '/_index.js' 
 ],

  optimization: {
    runtimeChunk: false,
    splitChunks: false,
  },
  
  // Where webpack outputs the assets and bundles
  output: {
    path: paths.build,
    filename: '[name].bundle.js',
    publicPath: paths.build,
  },

  // Customize the webpack build process
  plugins: [
    // Removes/cleans build folders and unused assets when rebuilding
    new CleanWebpackPlugin(),

    // Copies files from target to destination folder
    new CopyWebpackPlugin({
      patterns: [
        {
          from: paths.public,
          to: paths.build,
          globOptions: {
            ignore: ['*.DS_Store'],
          },
          noErrorOnMissing: true,
        },
      ],
    }),

    // Generates an HTML file from a template
    // Generates deprecation warning: https://github.com/jantimon/html-webpack-plugin/issues/1501
    new HtmlWebpackPlugin({
      title: config.title,
      description: config.description,
      template: paths.src + '/html/_index.html', // template file
      filename: 'index.html', // output file
      body: htmlBodyContent,
      inject: false, //dont inject anything
    }),

    //TODO: update this to include only the vendor files that are needed for the widget
    new MergeIntoSingleFilePlugin({
        files: {
            //create one file for all vendor js
            "vendor.js": [
                'node_modules/jquery/dist/jquery.min.js',
                'node_modules/@popperjs/core/dist/umd/popper.js',
                'node_modules/bootstrap/dist/js/bootstrap.js',
                'node_modules/d3/dist/d3.js',
            ],
            //create one file for all vendor css
            "vendor.css": [
                //nothing here yet
            ],
            //create one file for all widget js
            "widget.js": [
                paths.src + '/js/**/*.js',
            ]
        }
    }),

    // Extracts CSS into separate files
    new MiniCssExtractPlugin({
        filename: 'widget.css'
    }),
  ],

  // Determine how modules within the project are treated
  module: {
    rules: [
      // JavaScript: Use Babel to transpile JavaScript files
      { test: /\.js$/, use: ['babel-loader'] },

      // Images: Copy image files to build folder
      { test: /\.(?:ico|gif|png|jpg|jpeg)$/i, type: 'asset/resource' },

      // Fonts and SVGs: Inline files
      { test: /\.(woff(2)?|eot|ttf|otf|svg|)$/, type: 'asset/inline' },

      {
        test: /\.(sass|scss|css)$/,
        include: paths.src,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { sourceMap: false, importLoaders: 2, modules: false}, 
          },
          { loader: 'postcss-loader', options: { sourceMap: false } },
          { loader: 'sass-loader', options: { sourceMap: false } },
        ],
      },

    ],
  },

  optimization: {
    minimize: false, //TODO: change to minify only widget css and js but not vendor.
    minimizer: [new CssMinimizerPlugin({
        exclude: /vendor/,
        minimizerOptions: {
          preset: [
            "default",
            {
              discardComments: { removeAll: true },
            },
          ],
        },
      }),
    , '...'],
    runtimeChunk: {
      name: 'runtime',
    },
  },

  resolve: {
    modules: [paths.src, 'node_modules'],
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': paths.src,
      assets: paths.public,
    },
  },

  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
}