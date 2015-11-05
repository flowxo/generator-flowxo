// Generated on <%= (new Date).toISOString().split('T')[0] %> using <%= pkg.name %> <%= pkg.version %>
'use strict';

module.exports = function(grunt) {

  // Check we are using the correct version of node
  var semver = require('semver'),
      pjson = require('./package.json');

  if (!semver.satisfies(process.versions.node, pjson.engines.node)) {
    grunt.fatal('Incorrect Node version: you are running ' + process.versions.node + ', but the service requires a version matching semver ' + pjson.engines.node + '.\n');
  }

  // Fix grunt options
  // Can remove if using grunt 0.5
  // https://github.com/gruntjs/grunt/issues/908
  require('nopt-grunt-fix')(grunt);

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Load the Flow XO tasks
  grunt.loadNpmTasks('flowxo-sdk');

  // Define the configuration for all the tasks
  grunt.initConfig({
    env: {
      src: '.env'
    },
    watch: {
      js: {
        options: {
          spawn: true,
          interrupt: false,
          debounceDelay: 250
        },
        files: ['lib/**/*.js'],
        tasks: ['jshint']
      }
    },
    jshint: {
      options: {
        jshintrc: true,
        reporter: require('jshint-stylish')
      },
      source: {
        src: ['Gruntfile.js', 'lib/**/*.js']
      }
    },
    jsbeautifier: {
      options: {
        config: '.jsbeautifyrc'
      },
      source: {
        src: ['Gruntfile.js', 'lib/**/*.js']
      }
    },
    flowxo: {
      options: {
        credentialsFile: 'credentials.json',
        getService: function() {
          return require('./lib');
        },
      },
      init: {},
      auth: {
        options: {
          sslOAuthCallback: false
        }
      },
      run: {
        options: {
          runsFolder: 'runs',
          webhookPort: 9095
        }
      }
    }
  });

  // Initialise the SDK
  grunt.registerTask('init', ['flowxo:init']);

  // Authentication Tasks
  grunt.registerTask('auth', ['env', 'flowxo:auth']);

  // Run Tasks
  grunt.registerTask('run', ['env', 'flowxo:run']);

  // Preflight Tasks
  grunt.registerTask('preflight', ['env', 'jsbeautifier', 'jshint']);

  // Default Task
  grunt.registerTask('default', ['watch']);
};
