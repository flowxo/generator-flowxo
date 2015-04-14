'use strict';
var SDK = require('flowxo-sdk');
var path = require('path');
var Util = require('../run_util');
var async = require('async');
var inquirer = require('inquirer');

module.exports = function(grunt) {

  grunt.registerTask('run:replay', function() {
    var done = this.async();
    var REPLAY_FILE = grunt.option('replay') || 'runs.json';

    var tests = require(path.join(grunt.rootPath,REPLAY_FILE));

    var runner = new SDK.ScriptRunner(grunt.service, {
      credentials: grunt.credentials
    });

    /**
     * For each test we need to
     * - Display any title and description, if set
     * - Run the input.js script, and check it's format
     * - Display the standard_inputs and then the custom inputs
     * - Run the output.js script with the combined inputs
     * - Run the run.js script with the combined inputs
     * - Validate the output against the config
     * - Display the result to the user
     */
    async.eachSeries(tests, function(test, cb) {
      Util.run({
        method: test.method,
        runner: runner,
        service: grunt.service,
        inputs: test.inputs,
        grunt: grunt
      }, function(err){
        if(err){
          grunt.fail.fatal(err);
        }

        inquirer.prompt([{
          type: 'confirm',
          name: 'next',
          message: 'Run next test?'
        }],function(answers){
          return answers.next ? cb(null) : cb('Test Run Aborted');
        });
      });
    }, function(err) {
      if(err) {
        grunt.fail.fatal(err);
      }
      done();
    });



  });
};
