'use strict';
var Util = require('../run_util');
var SDK = require('flowxo-sdk');
var async = require('async');
var chai = require('chai');
chai.use(SDK.Chai);

module.exports = function(grunt) {
  grunt.registerTask('run:single', function() {

    var service = grunt.service;
    var credentials = grunt.credentials;

    if(service.methods.length === 0) {
      grunt.fail.fatal('You have no methods to run! Create new methods with `yo flowxo:method`');
    }

    var done = this.async();
    var method, script;

    var runner = new SDK.ScriptRunner(service, {
      credentials: credentials
    });

    async.waterfall([
      // Get a method
      Util.promptMethod.bind(Util, service),
      // Get a service script
      function(userMethod, callback) {
        method = userMethod;
        Util.promptScript(method, callback);
      },
      // Get some fields
      function(userScript, callback) {
        // If it's a run script, do some inputs
        script = userScript;
        if(userScript === 'run' && method.fields.input) {
          Util.promptFields(method.fields.input, callback);
        } else {
          callback(null, {});
        }
      },
      // Run the script
      function(inputs, callback) {
        runner.run(method.slug, script, {
          input: inputs
        }, function(err, result) {
          if(err) {
            callback(err);
          } else {
            callback(null, result);

          }
        });
      },
    ], function(err, result) {
      // Unless we have the --no-check-outputs option on
      if(!grunt.option('no-check-outputs')) {
        if(script === 'run') {
          chai.expect(result).to.matchConfig(method);
        } else if(script === 'input') {
          chai.expect(result).to.be.flowxo.input.fields;
        } else if(script === 'output') {
          chai.expect(result).to.be.flowxo.output.fields;
        }
      }
      Util.header(grunt, 'Script Output', 'green');
      Util.output(grunt, result);
      done();
    });
  });
};
