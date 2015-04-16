'use strict';

var inquirer = require('inquirer'),
    chalk = require('chalk'),
    async = require('async'),
    SDK = require('flowxo-sdk'),
    path = require('path'),
    fs = require('fs'),
    chai = require('chai');

chai.use(SDK.Chai);

var RunUtil = require('../utils/run');

var getReplayPath = function(grunt) {
  var replayFile = (grunt.option('name') || 'runs') + '.json';
  return path.join(grunt.rootPath, 'run', 'recorded', replayFile);
};

var runSingle = function(grunt, options) {
  RunUtil.runSingleScript({
    service: options.service,
    runner: options.runner,
    grunt: grunt
  }, function(err) {
    if(err) {
      grunt.fail.fatal(err);
    }
    options.done();
  });
};

var runMethod = function(grunt, options) {
  function runIt() {
    RunUtil.run({
      service: options.service,
      runner: options.runner,
      grunt: grunt
    }, function(err, result, method, inputs) {
      if(err) {
        grunt.fail.fatal(err);
      }

      if(options.runCompleted) {
        options.runCompleted(result, method, inputs);
      }

      inquirer.prompt({
        type: 'confirm',
        name: 'again',
        message: 'Would you like to run another method?',
        default: true
      }, function(answers) {
        return answers.again ? runIt() : options.done();
      });
    });
  }
  runIt();
};

var runRecorded = function(grunt, options) {
  var replayPath = getReplayPath(grunt);

  var tests;
  try {
    tests = require(replayPath);
  } catch(e) {
    tests = [];
  }

  grunt.log.subhead(chalk.cyan('Recording test run, saving to ' + replayPath));

  options.runCompleted = function(result, method, inputs) {
    tests.push({
      type: 'exec',
      method: method.slug,
      inputs: inputs
    });

    // Write the file after each successful run
    fs.writeFile(replayPath, JSON.stringify(tests, null, 2), function(err) {
      if(err) {
        grunt.fail.fatal(err);
      }
    });
  };

  runMethod(grunt, options);
};

var runReplayed = function(grunt, options) {
  var replayPath = getReplayPath(grunt);

  var tests;
  try {
    tests = require(replayPath);
  } catch(e) {
    grunt.fail.fatal('Unable to find recorded path: ' + replayPath);
  }

  grunt.log.subhead(chalk.cyan('Replaying test run from ' + replayPath));

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
  var i = tests.length;
  async.eachSeries(tests, function(test, cb) {
    i--;
    RunUtil.run({
      method: test.method,
      runner: options.runner,
      service: options.service,
      inputs: test.inputs,
      grunt: grunt
    }, function(err) {
      if(err) {
        grunt.fail.fatal(err);
      }

      if(i === 0) {
        // No more left, finish up.
        return cb();
      }

      inquirer.prompt([{
        type: 'confirm',
        name: 'next',
        message: 'Run next test?'
      }], function(answers) {
        return answers.next ? cb() : cb('Test Run Aborted');
      });
    });
  }, function(err) {
    if(err) {
      grunt.fail.fatal(err);
    }
    options.done();
  });
};

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

    var options = {
      service: service,
      runner: runner,
      done: done
    };

    // Figure out options
    if(grunt.option('replay')) {
      runReplayed(grunt, options);

    } else if(grunt.option('record')) {
      runRecorded(grunt, options);

    } else if(grunt.option('single')) {
      runSingle(grunt, options);

    } else {
      runMethod(grunt, options);
    }
  });
};
