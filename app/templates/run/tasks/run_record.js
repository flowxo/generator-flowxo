'use strict';
var SDK = require('flowxo-sdk'),
  Util = require('../run_util'),
  path = require('path'),
  fs = require('fs'),
  inquirer = require('inquirer');

module.exports = function(grunt) {

  grunt.registerTask('runRecordTask', function() {

    var service = grunt.getService();

    var done = this.async();
    var REPLAY_FILE = grunt.option('replay') || 'runs.json';
    var tests;

    try {
      tests = require(path.join(grunt.rootPath, REPLAY_FILE));
    } catch(e) {
      tests = [];
    }

    var runner = new SDK.ScriptRunner(service, {
      credentials: grunt.credentials
    });

    function save(cb) {
      fs.writeFile(path.join(grunt.rootPath, REPLAY_FILE), JSON.stringify(tests, null, 2), cb);
    }

    // function menu() {
    //   inquirer.prompt([{
    //     type: 'expand',
    //     message: 'What would you like to do next?',
    //     name: 'next',
    //     choices: [{
    //       key: 'r',
    //       name: 'Record another method',
    //       value: 'method'
    //     }, {
    //       key: 'm',
    //       name: 'Record a message',
    //       value: 'message'
    //     }, {
    //       key: 'q',
    //       name: 'Quit',
    //       value: 'quit'
    //     }, {
    //       key: 'a',
    //       name: 'Abort',
    //       value: 'abort'
    //     }]
    //   }], function(answers) {
    //     switch(answers.next) {
    //       case 'quit':
    //         save(done);
    //         break;
    //       case 'message':
    //         console.log('Doing message');
    //         break;
    //       case 'method':
    //         run();
    //         break;
    //       case 'abort':
    //         done();
    //         break;
    //     }
    //   });
    // }

    function run() {
      Util.run({
        runner: runner,
        service: service,
        grunt: grunt
      }, function(err, result, method, inputs) {
        if(err) {
          grunt.fail.fatal(err);
        }

        tests.push({
          type: 'exec',
          method: method.slug,
          inputs: inputs
        });

        inquirer.prompt({
          type: 'confirm',
          name: 'again',
          message: 'Would you like to run another method?',
          default: true
        }, function(answers) {
          return answers.again ? run() : save(done);
        });

      });
    }


    run();
  });
  grunt.registerTask('run:record',['env','runRecordTask']);
};
