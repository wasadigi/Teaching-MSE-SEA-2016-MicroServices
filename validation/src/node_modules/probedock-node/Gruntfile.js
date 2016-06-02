module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    bump: {
      options: {
        commit: false,
        createTag: false,
        push: false
      }
    },

    clean: {
      doc: [ 'doc' ],
      ghp: [ 'tmp/gh-pages' ]
    },

    docker: {
      options: {
        inDir: 'lib',
        colourScheme: 'native'
      },
      doc: {
        src: [ 'lib' ],
        dest: 'doc/annotated'
      },
      ghp: {
        src: [ 'lib' ],
        dest: 'tmp/gh-pages/annotated'
      }
    },

    'gh-pages': {
      options: {
        base: 'tmp/gh-pages',
        add: true,
        message: 'Updated annotated source'
      },
      all: {
        src: '**'
      }
    },

    jasmine_node: {
      all: ['spec/']
    },

    jshint: {
      all: [
        'Gruntfile.js',
        'lib/**/*.js'
      ]
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-docker');
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-jasmine-node');

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'jasmine_node']);
  grunt.registerTask('doc', [ 'clean:doc', 'docker:doc' ]);
  grunt.registerTask('ghp', [ 'clean:ghp', 'docker:ghp', 'gh-pages' ]);
};
