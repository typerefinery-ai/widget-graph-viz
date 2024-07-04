const { merge } = require('webpack-merge')

const common = require('./webpack.common')
const { write } = require('@popperjs/core')
const paths = require('./webpack._paths')

module.exports = merge(common, {
  // Set the mode to development or production
  mode: 'development',

  // Control how source maps are generated
  devtool: 'inline-source-map',

  // Spin up a server for quick development
  devServer: {
    static: {
        directory: paths.build,
    },
    historyApiFallback: true,
    watchFiles: [paths.src],
    // open: true,
    compress: false,
    hot: true,
    port: 4001,
    devMiddleware: {
        writeToDisk: true,
    }
  },

  
})