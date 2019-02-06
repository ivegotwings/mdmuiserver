'use strict';

const { resolve, join } = require('path');
const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { InjectManifest } = require('workbox-webpack-plugin');
const webpack = require('webpack');

const ENV = process.argv.find(arg => arg.includes('production'))
  ? 'production'
  : 'development';
const ANALYZE = process.argv.find(arg => arg.includes('--analyze'));
const OUTPUT_PATH = ENV === 'production' ? resolve('build/ui-platform/static/es6-bundled') : resolve('build/ui-platform/static/es6-unbundled');
const INDEX_TEMPLATE = resolve('index.html');
const webcomponentsjs = './node_modules/@webcomponents/webcomponentsjs';
const fragments = require('./dynamic-fragments.js');

const polyfills = [
  {
    from: resolve(`${webcomponentsjs}/webcomponents-*.{js,map}`),
    to: join(OUTPUT_PATH, 'node_modules/@webcomponents/webcomponentsjs/'),
    flatten: true
  },
  {
    from: resolve(`${webcomponentsjs}/bundles/*.{js,map}`),
    to: join(OUTPUT_PATH, 'node_modules/@webcomponents/webcomponentsjs/', 'bundles'),
    flatten: true
  },
  {
    from: resolve(`${webcomponentsjs}/custom-elements-es5-adapter.js`),
    to: join(OUTPUT_PATH, 'node_modules/@webcomponents/webcomponentsjs/'),
    flatten: true
  }
];

const assets = [
  {
    from: resolve('./src/elements/bedrock-style-manager/themes'),
    to: join(OUTPUT_PATH, 'src/elements/bedrock-style-manager/themes/')
  },
  {
    from: resolve('./src/images'),
    to: join(OUTPUT_PATH, 'src/images')
  },
  {
    from: resolve('./src/resources'),
    to: join(OUTPUT_PATH, 'src/resources')
  },
  {
    from: resolve('./src/scripts'),
    to: join(OUTPUT_PATH, 'src/scripts')
  },
  {
    from: resolve('./src/shared'),
    to: join(OUTPUT_PATH, 'src/shared')
  },
  {
    from: resolve('./src/elements/bedrock-externalref-socketio/socket.io.min.js'),
    to: join(OUTPUT_PATH, 'src/elements/bedrock-externalref-socketio/'),
    flatten: true
  },
  {
    from: resolve('./src/elements/bedrock-externalref-d3js/bedrock-externalref-d3js.js'),
    to: join(OUTPUT_PATH, 'src/elements/bedrock-externalref-d3js/'),
    flatten:true
  },
  {
    from: resolve('./src/elements/bedrock-externalref-falcor/falcor.browser.js'),
    to: join(OUTPUT_PATH, 'src/elements/bedrock-externalref-falcor/'),
    flatten:true
  },
  {
    from: resolve('./src/elements/bedrock-type-extensions/string-extensions.js'),
    to: join(OUTPUT_PATH, 'src/elements/bedrock-type-extensions/'),
    flatten: true
  },
  {
    from: resolve('./node_modules/web-animations-js/web-animations-next.min.{js,map}'),
    to: join(OUTPUT_PATH, 'node_modules/web-animations-js/'),
    flatten: true,
  },
  {
    from: resolve('./node_modules/intl-messageformat/dist/intl-messageformat.min.{js,map}'),
    to: join(OUTPUT_PATH, 'node_modules/intl-messageformat/dist/'),
    flatten: true
  },
  {
    from: resolve('./node_modules/moment/min/moment-with-locales.min.js'),
    to: join(OUTPUT_PATH, 'node_modules/moment/min/'),
    flatten: true
  },
  {
    from: resolve('./node_modules/underscore/underscore.{js,map}'),
    to: join(OUTPUT_PATH, 'node_modules/underscore/'),
    flatten: true
  }
];

const commonConfig = merge([
  {
    entry: {
      app: './src/index.js',
    },
    output: {
      path: OUTPUT_PATH + '/src/elements/bundles',
      filename: '[name].[chunkhash:8].js',
      chunkFilename: '[name].[chunkhash:8].js',
      publicPath: '/src/elements/bundles/'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          // We need to transpile Polymer,so whitelist packages containing ES modules
          exclude: /node_modules\/(?!(@webcomponents\/shadycss|lit-html|@polymer|)\/).*/,
          use: [
            {
              loader: 'uglify-template-string-loader'
            },
            {
              loader: 'babel-loader',
              options: {
                babelrc: true,
                extends: join(__dirname + '/.babelrc'),
                cacheDirectory: true,
                envName: ENV
              }
            }
          ]
        }
      ]
    },
    plugins:[
      new HtmlWebpackPlugin({
        template: INDEX_TEMPLATE,
        filename: '../../../index.html',
        chunksSortMode: "none"
      }),
      new CleanWebpackPlugin([OUTPUT_PATH], { verbose: true }),
      new CopyWebpackPlugin([...polyfills, ...assets]),
      new webpack.DefinePlugin({
        __PRODUCTION__: JSON.stringify(true),
      })
    ]
  }
]);

const developmentConfig = merge([
  {
    devtool: 'cheap-module-source-map'
  }
]);

const analyzeConfig = ANALYZE ? [new BundleAnalyzerPlugin()] : [];

const productionConfig = merge([
  {
    devtool: 'nosources-source-map',
    optimization: {
      splitChunks: {
        chunks: 'async',
        minSize: 20000,
        maxSize:500000,
        minChunks: 1,
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
        name: false,
        automaticNameDelimiter: '-',
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'npm',
            priority: -10,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
            name:false
          },
          commons: {
            minChunks: 4,
            priority: -15,
            chunks: 'all',
            name: 'common',

          }
        }
      },
      minimizer: [
        new TerserWebpackPlugin({
          terserOptions: {
            parse: {
              // we want terser to parse ecma 8 code. However, we don't want it
              // to apply any minfication steps that turns valid ecma 5 code
              // into invalid ecma 5 code. This is why the 'compress' and 'output'
              // sections only apply transformations that are ecma 5 safe
              // https://github.com/facebook/create-react-app/pull/4234
              ecma: 8
            },
            compress: {
              ecma: 5,
              warnings: false,
              // Disabled because of an issue with Uglify breaking seemingly valid code:
              // https://github.com/facebook/create-react-app/issues/2376
              // Pending further investigation:
              // https://github.com/mishoo/UglifyJS2/issues/2011
              comparisons: false
            },
            output: {
              ecma: 5,
              comments: false,
              // Turned on because emoji and regex is not minified properly using default
              // https://github.com/facebook/create-react-app/issues/2488
              ascii_only: true
            }
          },
          // Use multi-process parallel running to improve the build speed
          // Default number of concurrent runs: os.cpus().length - 1
          parallel: true,
          // Enable file caching
          cache: true,
          sourceMap: true
        })
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: INDEX_TEMPLATE,
        chunksSortMode: "none",
        minify: {
          collapseWhitespace: true,
          removeComments: true,
          minifyCSS: true,
          minifyJS: true
        }
      }),
      ...analyzeConfig
    ]
  }
]);

module.exports = mode => {
  if (mode === 'production') {
    return merge(commonConfig, productionConfig, { mode });
  }

  return merge(commonConfig, developmentConfig, { mode });
};