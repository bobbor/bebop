module.exports = function(grunt) {
  grunt.initConfig({
    clean: {
      dist: ['dist']
    },
    copy: {
      dist: {
        files: [{
          dest: 'dist/bebop.js',
          src: 'src/bebop.js'
        }]
      }
    },
    uglify: {
      dist: {
        files: [{
          dest: 'dist/bebop.min.js',
          src: 'dist/bebop.js'
        }]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('test', ['karma', 'coveralls']);

  grunt.registerTask('default', ['clean', 'copy', 'uglify']);
};
