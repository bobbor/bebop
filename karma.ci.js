module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['mocha', 'fixture', 'chai', 'sinon'],
    files: [
      {pattern: 'src/*.js'},
      {pattern: 'test/fixtures/**/*'},
      {pattern: 'test/tests/*.test.js'},
      {pattern: 'test/io/*', watched: false, included: false, served: true}
    ],
    exclude: [],
    preprocessors: {
      'test/fixtures/**/*.html': ['html2js'],
      'test/fixtures/**/*.json': ['html2js'],
      'src/*.js': ['coverage']
    },
    proxies: {
      '/io/': '/base/test/io/'
    },
    reporters: ['coverage'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['PhantomJS'],
    singleRun: true,
    coverageReporter: {
      dir: 'coverage',
      reporters: [{
        type: 'lcovonly', subdir: '.', file: 'lcov.info'
      }]
    }
  });
};
