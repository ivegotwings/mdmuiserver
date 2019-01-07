module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {        
        // Do not transform modules to CommonJS
        modules: false,
        
        // Do not transform async/await to generators.
        exclude: [
          'transform-async-to-generator',
          'transform-regenerator'
        ],

        targets: {
          "esmodules": true
        }
      }
    ]
  ],
  plugins: [
    '@babel/syntax-dynamic-import',
  ],
  env: {
    production: {
      plugins: [
        [
          'template-html-minifier',
          {
            modules: {
              '@polymer/polymer/lib/utils/html-tag.js': ['html']
            },
            htmlMinifier: {
              collapseWhitespace: true,
              minifyCSS: true,
              removeComments: true
            }
          }
        ]
      ]
    }
  }
};