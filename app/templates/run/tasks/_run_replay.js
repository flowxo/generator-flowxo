'use strict';
var SDK = require('flowxo-sdk');
var path = require('path');
var Util = require('../run_util');
var async = require('async');
var inquirer = require('inquirer');

module.exports = function(grunt) {

  grunt.registerTask('runReplayTask', function() {
    var done = this.async();
    var REPLAY_FILE = grunt.option('name') || 'runs.json';
    var REPLAY_PATH = path.join(grunt.rootPath,'run','recorded',REPLAY_FILE);

    var service = grunt.getService();
    var tests;

    try{
      tests = require(REPLAY_PATH);
    }catch(e){
      grunt.fail.fatal('Unable to find recorded path: ' + REPLAY_PATH);
    }


    var runner = new SDK.ScriptRunner(service, {
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
    var i = 0;
    async.eachSeries(tests, function(test, cb) {
      i++;
      Util.run({
        method: test.method,
        runner: runner,
        service: service,
        inputs: test.inputs,
        grunt: grunt
      }, function(err) {
        if(err) {
          grunt.fail.fatal(err);
        }

        if(i===tests.length){
          done();
        }

        inquirer.prompt([{
          type: 'confirm',
          name: 'next',
          message: 'Run next test?'
        }], function(answers) {
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
