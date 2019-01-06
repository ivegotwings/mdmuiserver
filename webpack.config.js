'use strict';

const { resolve, join } = require('path');
const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const BrotliPlugin = require('brotli-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { InjectManifest } = require('workbox-webpack-plugin');

const ENV = process.argv.find(arg => arg.includes('production'))
  ? 'production'
  : 'development';
const ANALYZE = process.argv.find(arg => arg.includes('--analyze'));
const OUTPUT_PATH = ENV === 'production' ? resolve('build-prod') : resolve('build-dev');
const INDEX_TEMPLATE = resolve('./build-resources/index.html');
const webcomponentsjs = './node_modules/@webcomponents/webcomponentsjs';

const polyfills = [
  {
    from: resolve(`${webcomponentsjs}/webcomponents-*.{js,map}`),
    to: join(OUTPUT_PATH, 'vendor'),
    flatten: true
  },
  {
    from: resolve(`${webcomponentsjs}/bundles/*.{js,map}`),
    to: join(OUTPUT_PATH, 'vendor', 'bundles'),
    flatten: true
  },
  {
    from: resolve(`${webcomponentsjs}/custom-elements-es5-adapter.js`),
    to: join(OUTPUT_PATH, 'vendor'),
    flatten: true
  }
];

const assets = [
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
    from: resolve('./dist/src/elements/bedrock-externalref-socketio/socket.io.min.js'),
    to: join(OUTPUT_PATH, 'src/elements/bedrock-externalref-socketio/')
  },
  {
    from: resolve('./dist/src/elements/bedrock-externalref-falcor/falcor.browser.min.js'),
    to: join(OUTPUT_PATH, 'src/elements/bedrock-externalref-falcor/')
  },
  {
    from: resolve('./dist/src/elements/bedrock-type-extensions/string-extensions.js'),
    to: join(OUTPUT_PATH, 'src/elements/bedrock-type-extensions/')
  },
  {
    from: resolve('./node_modules/web-animations-js/web-animations-next.min.js'),
    to: join(OUTPUT_PATH, 'node_modules/web-animations-js/')
  },
  {
    from: resolve('./node_modules/intl-messageformat/dist/intl-messageformat.min.js'),
    to: join(OUTPUT_PATH, 'node_modules/intl-messageformat/dist/')
  },
  {
    from: resolve('./node_modules/moment/min/moment-with-locales.min.js'),
    to: join(OUTPUT_PATH, 'node_modules/moment/min/')
  },
  {
    from: resolve('./node_modules/underscore/underscore.js'),
    to: join(OUTPUT_PATH, 'node_modules/underscore/')
  },
  {
    from: resolve('./dist/src/elements/app-common/app-common.js'),
    to: join(OUTPUT_PATH, 'src/elements/app-common/')
  }
];

const commonConfig = merge([
  {
    entry: {
      app: './dist/src/index.js',
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
              loader: 'babel-loader',
              options: {
                babelrc: true,
                extends: join(__dirname + '/.babelrc'),
                cacheDirectory: true,
                envName: ENV
              }
            },
            {
              loader: 'uglify-template-string-loader'
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
      new CopyWebpackPlugin([...polyfills, ...assets])
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
      new CleanWebpackPlugin([OUTPUT_PATH], { verbose: true }),
      new CopyWebpackPlugin([...assets]),
      new HtmlWebpackPlugin({
        template: INDEX_TEMPLATE,
        minify: {
          collapseWhitespace: true,
          removeComments: true,
          minifyCSS: true,
          minifyJS: true
        }
      }),
      new CompressionPlugin({ test: /\.js(\.map)?$/i }),
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