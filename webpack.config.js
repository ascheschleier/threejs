const path = require('path')
var webpack = require('webpack');

module.exports = {
  resolve: {
    alias: {
      jquery: "jquery/src/jquery",
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    })
  ],
  entry: './src/scrollTween.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js',
  },
  devServer: {
    publicPath: '/public/',
    compress: true,
    port: 9000
  }
}
