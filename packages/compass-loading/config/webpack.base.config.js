const path = require('path');
const project = require('./project');

module.exports = {
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx', '.json', '.less', '.wasm'],
    alias: {
      actions: path.join(project.path.src, 'actions'),
      components: path.join(project.path.src, 'components'),
      constants: path.join(project.path.src, 'constants'),
      fonts: path.join(project.path.src, 'assets/fonts'),
      images: path.join(project.path.src, 'assets/images'),
      less: path.join(project.path.src, 'assets/less'),
      models: path.join(project.path.src, 'models'),
      modules: path.join(project.path.src, 'modules'),
      plugin: path.join(project.path.src, 'index.js'),
      stores: path.join(project.path.src, 'stores'),
      utils: path.join(project.path.src, 'utils'),
      'react-dom': '@hot-loader/react-dom'
    }
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' }
        ]
      },
      // For styles that have to be global (see https://github.com/css-modules/css-modules/pull/65)
      {
        test: /\.less$/,
        include: [/\.global/, /bootstrap/],
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              modules: false
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: function() {
                return [
                  project.plugin.autoprefixer
                ];
              }
            }
          },
          {
            loader: 'less-loader',
            options: {
              noIeCompat: true
            }
          }
        ]
      },
      // For CSS-Modules locally scoped styles
      {
        test: /\.less$/,
        exclude: [/\.global/, /bootstrap/, /node_modules/],
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: {
                localIdentName: 'LoadingPlugin_[name]-[local]__[hash:base64:5]'
              }
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: function() {
                return [
                  project.plugin.autoprefixer
                ];
              }
            }
          },
          {
            loader: 'less-loader',
            options: {
              noIeCompat: true
            }
          }
        ]
      },
      // For native modules to be able to be loaded.
      {
        test: /\.node$/,
        use: 'node-loader'
      },
      {
        test: /node_modules[\\\/]JSONStream[\\\/]index\.js/,
        use: [{ loader: 'shebang-loader' }]
      },
      {
        test: /\.(js|jsx)$/,
        use: [{
          loader: 'babel-loader',
          options: {
            root: path.resolve(__dirname, '..'),
            cacheDirectory: !process.env.CI
          }
        }],
        exclude: /(node_modules)/
      }
    ]
  }
};
