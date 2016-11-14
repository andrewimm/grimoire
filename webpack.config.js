const path = require('path');
const webpack = require('webpack');

const banner = `/**
 * Grimoire.js
 * Version ${require('./package.json').version}
 * https://github.com/andrewimm/grimoire
 */
`;

module.exports = {
  context: path.join(__dirname, 'lib'),
  entry: './Grimoire.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'grimoire.js',
    libraryTarget: 'var',
    library: 'Grimoire',
  },
  plugins: [
    new webpack.DefinePlugin({
      '__FORCE_POLYFILL__': 'false'
    }),
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.BannerPlugin(banner, {raw: true})
  ]
};
