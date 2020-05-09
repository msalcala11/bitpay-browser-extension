/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const webpack = require('webpack');
const wextManifest = require('wext-manifest');
const ZipPlugin = require('zip-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CspHtmlWebpackPlugin = require('csp-html-webpack-plugin');
const WriteWebpackPlugin = require('write-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ExtensionReloader = require('webpack-extension-reloader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const manifestInput = require('./src/manifest');

const viewsPath = path.join(__dirname, 'views');
const sourcePath = path.join(__dirname, 'src');
const destPath = path.join(__dirname, 'extension');
const nodeEnv = process.env.NODE_ENV || 'development';
const targetBrowser = process.env.TARGET_BROWSER;
const manifest = wextManifest[targetBrowser](manifestInput);

const dotEnv = new Dotenv({
  path: process.env.NODE_ENV === 'production' ? '.env' : `.env.${process.env.NODE_ENV}`,
  defaults: true
});

const extensionReloaderPlugin =
  nodeEnv === 'development'
    ? new ExtensionReloader({
        port: 9090,
        reloadPage: true,
        entries: {
          // TODO: reload manifest on update
          contentScript: 'contentScript',
          background: 'background',
          extensionPage: ['popup', 'options']
        }
      })
    : () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        this.apply = () => {};
      };

const getExtensionFileType = browser => {
  if (browser === 'opera') {
    return 'crx';
  }

  if (browser === 'firefox') {
    return 'xpi';
  }

  return 'zip';
};

module.exports = {
  mode: nodeEnv,

  node: {
    fs: 'empty'
  },

  entry: {
    background: path.join(sourcePath, 'background', 'index.ts'),
    contentScript: path.join(sourcePath, 'content-script', 'index.ts'),
    popup: path.join(sourcePath, 'popup', 'index.tsx'),
    options: path.join(sourcePath, 'options', 'index.tsx')
  },

  output: {
    filename: 'js/[name].bundle.js',
    path: path.join(destPath, targetBrowser)
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    alias: {
      'webextension-polyfill-ts': path.resolve(path.join(__dirname, 'node_modules', 'webextension-polyfill-ts'))
    }
  },

  module: {
    rules: [
      {
        test: /\.(js|ts)x?$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader // It creates a CSS file per JS file which contains CSS
          },
          {
            loader: 'css-loader', // Takes the CSS files and returns the CSS with imports and url(...) for Webpack
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'postcss-loader', // For autoprefixer
            options: {
              ident: 'postcss',
              // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
              plugins: [require('autoprefixer')()]
            }
          },
          'resolve-url-loader', // Rewrites relative paths in url() statements
          'sass-loader' // Takes the Sass/SCSS file and compiles to the CSS
        ]
      }
    ]
  },

  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    // environmental variables
    new webpack.EnvironmentPlugin(['NODE_ENV', 'TARGET_BROWSER']),
    dotEnv,
    // delete previous build files
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        path.join(process.cwd(), `extension/${targetBrowser}`),
        path.join(process.cwd(), `extension/${targetBrowser}.${getExtensionFileType(targetBrowser)}`)
      ],
      cleanStaleWebpackAssets: false,
      verbose: true
    }),
    new HtmlWebpackPlugin({
      template: path.join(viewsPath, 'popup.html'),
      inject: 'body',
      chunks: ['popup'],
      filename: 'popup.html'
    }),
    new HtmlWebpackPlugin({
      template: path.join(viewsPath, 'options.html'),
      inject: 'body',
      chunks: ['options'],
      filename: 'options.html'
    }),
    new CspHtmlWebpackPlugin(
      {
        'default-src': [
          "'self'",
          dotEnv.definitions['process.env.API_ORIGIN'].replace(/"/g, ''),
          'https://www.google-analytics.com',
          'https://ssl.google-analytics.com'
        ],
        'base-uri': "'self'",
        'img-src': [
          'https://gravatar.com',
          'https://*.wp.com',
          dotEnv.definitions['process.env.API_ORIGIN'].replace(/"/g, '')
        ],
        'font-src': ['https://fonts.gstatic.com'],
        'object-src': "'none'",
        'script-src':
          process.env.NODE_ENV === 'production'
            ? ["'self'", 'https://www.google-analytics.com']
            : [
                "'self'",
                'https://www.google-analytics.com',
                'https://ssl.google-analytics.com',
                "'unsafe-eval'",
                "'unsafe-inline'"
              ],
        'style-src': ["'self'", 'https://fonts.googleapis.com/', "'unsafe-inline'"]
      },
      {
        enabled: true,
        hashingMethod: 'sha256',
        hashEnabled: {
          'script-src': process.env.NODE_ENV === 'production',
          'style-src': false
        },
        nonceEnabled: {
          'script-src': process.env.NODE_ENV === 'production',
          'style-src': false
        }
      }
    ),
    // write css file(s) to build folder
    new MiniCssExtractPlugin({
      filename: 'css/[name].css'
    }),
    // copy static assets
    new CopyWebpackPlugin([
      {
        from: 'src/assets',
        to: 'assets'
      }
    ]),
    // write manifest.json
    new WriteWebpackPlugin([
      {
        name: manifest.name,
        data: Buffer.from(manifest.content)
      }
    ]),
    // plugin to enable browser reloading in development mode
    extensionReloaderPlugin
  ],

  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        terserOptions: {
          output: {
            comments: false
          }
        },
        extractComments: false
      }),
      new ZipPlugin({
        path: destPath,
        extension: `${getExtensionFileType(targetBrowser)}`,
        filename: `${targetBrowser}`
      })
    ]
  }
};
