// Generated on <%= (new Date).toISOString().split('T')[0] %> using <%= pkg.name %> <%= pkg.version %>
'use strict';

var SDK = require('flowxo-sdk'),
    chai = require('chai');

chai.use(SDK.Chai);

/******************************************************************************
 * Global Vars
 ******************************************************************************/
var CREDENTIALS_FILENAME = 'credentials.json';

module.exports = function(grunt) {

  // Fix grunt options
  // Can remove if using grunt 0.5
  // https://github.com/gruntjs/grunt/issues/908
  require('nopt-grunt-fix')(grunt);

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Service
  grunt.getService = function() {
    return require('./lib');
  };

  // Allows plugins to require and save files relative to this file
  grunt.rootPath = __dirname;

  // Credentials
  try {
    grunt.credentials = require('./' + CREDENTIALS_FILENAME);
  } catch(e) {
    grunt.credentials = {};
  }

  // Load the internal tasks
  grunt.loadTasks('run/tasks');

  // Define the configuration for all the tasks
  grunt.initConfig({
    env: {
      src: '.env'
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          quiet: false,
          clearRequireCache: false,
          require: './tests/helpers'
        },
        src: ['tests/bootstrap.js', 'tests/**/*.spec.js']
      }
    },
    watch: {
      js: {
        options: {
          spawn: true,
          interrupt: false,
          debounceDelay: 250
        },
        files: ['lib/**/*.js', 'tests/**/*.spec.js'],
        tasks: ['jshint', 'test']
      }
    },
    jshint: {
      options: {
        jshintrc: true,
        reporter: require('jshint-stylish')
      },
      source: {
        src: ['Gruntfile.js', 'lib/**/*.js']
      },
      tests: {
        src: ['tests/**/*.js'],
      }
    }
  });

  // Authentication Tasks
  grunt.registerTask('auth', ['env', 'authTask']);

  // Run Tasks
  grunt.registerTask('run', ['env', 'runTask']);

  // Test Tasks
  grunt.registerTask('test', ['env', 'mochaTest']);

  // Default Task
  grunt.registerTask('default', ['env', 'jshint', 'test', 'watch']);
};
