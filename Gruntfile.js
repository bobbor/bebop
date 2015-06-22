module.exports = function(grunt) {
  grunt.initConfig({
    clean: {
      dist: ['dist']
    },
    coffee: {
      dist: {
        files: [{
          dest: 'dist/bebop.js',
          src: 'src/bebop.coffee'
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
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('test', ['karma', 'coveralls']);

  grunt.registerTask('default', ['clean', 'coffee', 'uglify']);
};
