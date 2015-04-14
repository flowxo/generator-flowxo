'use strict';
var inquirer = require('inquirer');
var Util = require('../run_util');
var SDK = require('flowxo-sdk');
var chai = require('chai');
chai.use(SDK.Chai);

module.exports = function(grunt) {

  grunt.registerTask('runTask', function() {
    var service = grunt.getService();

    if(service.methods.length === 0) {
      grunt.fail.fatal('You have no methods to run! Create new methods with `yo flowxo:method`');
    }

    var done = this.async();

    var runner = new SDK.ScriptRunner(service, {
      credentials: grunt.credentials
    });

    function run() {
      Util.run({
        service: service,
        runner: runner,
        grunt: grunt
      }, function(err) {
        if(err) {
          grunt.fail.fatal(err);
        }

        inquirer.prompt({
          type: 'confirm',
          name: 'again',
          message: 'Would you like to run another method?',
          default: true
        }, function(answers) {
          return answers.again ? run() : done();
        });
      });
    }
    run();
  });
};
