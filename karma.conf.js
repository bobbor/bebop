module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['mocha', 'fixture', 'chai', 'sinon'],
    files: [
      {pattern: 'src/*.coffee'},
      {pattern: 'test/fixtures/**/*'},
      {pattern: 'test/tests/*.test.coffee'},
      {pattern: 'test/io/*', watched: false, included: false, served: true}
    ],
    exclude: [],
    preprocessors: {
      'test/tests/*.test.coffee': ['coffee'],
      'test/fixtures/**/*.html': ['html2js'],
      'test/fixtures/**/*.json': ['html2js'],
      'src/*.coffee': ['coffee']
    },
    proxies: {
      '/io/': '/base/test/io/'
    },
    reporters: ['dots'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['PhantomJS'],
    singleRun: false,
    coverageReporter: {
      dir: 'coverage',
      reporters: [{
        type: 'html', subdir: 'html'
      }]
    },
    coffeePreprocessor: {
      options: {
        bare: true,
        sourceMap: false
      },
      transformPath: function (path) {
        return path.replace(/\.coffee$/, '.js');
      }
    }
  });
};
