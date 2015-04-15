'use strict';

var util = require('util'),
    inquirer = require('inquirer'),
    chalk = require('chalk'),
    async = require('async'),
    SDK = require('flowxo-sdk'),
    FxoUtils = require('flowxo-utils'),
    chai = require('chai');

chai.use(SDK.Chai);

var CommonUtil = require('./common');

var RunUtil = {};

RunUtil.displayScriptData = function(grunt, data) {
  CommonUtil.header(grunt, 'DATA:', 'green');
  grunt.log.writeln(chalk.cyan(JSON.stringify(data, null, 2)));
};

RunUtil.displayScriptOutput = function(grunt, outputs, data) {
  if(outputs.length) {
    // First create an indexed hash of fields
    var fieldsIdx = outputs.reduce(function(data, f) {
      data[f.key] = f;
      return data;
    }, {});

    var labelise = function(data) {
      // Flatten the output.
      var flattened = FxoUtils.getFlattenedFields(data);

      // Create a new object, with the key as the label from
      // the output. If there is no output field corresponding
      // to the data, ignore it.
      return flattened.reduce(function(result, data) {
        var field = fieldsIdx[data.key];
        if(field) {
          result[field.label] = data.value;
        }
        return result;
      }, {});
    };

    var dataLabelled = util.isArray(data) ?
      data.map(labelise) :
      labelise(data);

    CommonUtil.header(grunt, 'LABELLED:', 'green');
      grunt.log.writeln(chalk.cyan(JSON.stringify(dataLabelled, null, 2)));
  }
};

RunUtil.promptScript = function(method, cb) {
  var prompts = [{
    type: 'list',
    name: 'script',
    message: 'Select a script',
    choices: Object.keys(method.scripts)
  }];

  inquirer.prompt(prompts, function(result) {
    cb(null, result.script);
  });
};

RunUtil.promptMethod = function(service, cb) {
  var prompts = [{
    type: 'list',
    name: 'method',
    message: 'Method',
    choices: service.methods.map(function(m) {
      return {
        name: m.name,
        value: m
      };
    })
  }];

  inquirer.prompt(prompts, function(result) {
    cb(null, result.method);
  });
};

RunUtil.validateService = function(grunt, service) {
  try {
    chai.expect(service).to.be.a.flowxo.service;
  } catch(e) {
    CommonUtil.header(grunt, 'SERVICE CONFIG VALIDATION FAILED', 'red');
    grunt.fail.fatal(e);
  }
};

RunUtil.checkRunScriptResult = function(result, method) {
  if(method.kind === 'trigger') {
    chai.expect(result).to.be.a.flowxo.trigger.script.output;
  } else {
    chai.expect(result).to.be.a.flowxo.script.output;
  }
};

RunUtil.run = function(options, cb) {
  var grunt = options.grunt;
  var runner = options.runner;
  var service = options.service;
  var method = options.method;

  // Firstly, validate the service.
  // If it is not configured correctly, end.
  RunUtil.validateService(grunt, service);

  var inputs = options.inputs || [],
      outputs = [];

  var inputsPredefined = inputs.length !== 0;

  var fieldPromptOptions = {
    validateRequired: false
  };

  function addInputIfDefined(field, answers, custom) {
    var ans = answers[field.key];

    /* jshint eqnull: true */
    if(ans != null && ans !== '') {
      var f = {
        key: field.key,
        type: field.type || 'text',
        value: answers[field.key],
        custom: custom === true,
        label: field.label
      };
      inputs.push(f);
    }
    /* jshint eqnull: false */
  }

  function addInputsIfDefined(fields, answers, custom) {
    fields.forEach(function(field) {
      addInputIfDefined(field, answers, custom);
    });
  }

  async.waterfall([
    // Method Selection
    function(callback) {
      if(typeof method !== 'undefined') {
        method = service.getMethod(method);
        CommonUtil.header(grunt, 'Method: ' + method.name);
        callback(null, method);
      } else {
        CommonUtil.header(grunt, 'Method Selection');
        RunUtil.promptMethod(service, callback);
      }
    },

    // Static Inputs
    function(method, callback) {
      if(method.fields.input && method.fields.input.length) {
        CommonUtil.header(grunt, 'Standard Input Fields');

        // If we've been given them, just set and move on
        if(inputsPredefined) {
          inputs.forEach(function(input) {
            if(!input.custom) {
              grunt.log.writeln(input.label + ': ' + input.value);
            }
          });
          return callback(null, method);
        }

        // Else prompt for them
        CommonUtil.promptFields(method.fields.input, fieldPromptOptions, function(err, answers) {
          if(err) {
            return callback(err);
          } else {
            addInputsIfDefined(method.fields.input, answers);
            callback(null, method);
          }
        });
      } else {
        callback(null, method);
      }
    },

    // input.js
    function(method, callback) {
      if(!method.scripts.input) {
        return callback(null, method);
      }
      CommonUtil.header(grunt, 'Custom Input Fields');
      runner.run(method.slug, 'input', {}, function(err, customInputFields) {
        if(err) {
          return callback(err);
        }

        try {
          chai.expect(customInputFields).to.be.flowxo.input.fields;
        } catch(e) {
          grunt.fail.fatal('Error in return from input.js script: ' + e.toString());
        }

        // If we've been given some values, use those
        if(inputsPredefined) {
          inputs.forEach(function(input) {
            if(input.custom) {
              grunt.log.writeln(input.label + ': ' + input.value);
            }
          });
          return callback(null, method);
        }

        // Else prompt for some
        CommonUtil.promptFields(customInputFields, fieldPromptOptions, function(err, answers) {
          if(err) {
            callback(err);
          } else {
            addInputsIfDefined(customInputFields, answers, true);
            callback(null, method);
          }
        });
      });
    },

    // output.js
    function(method, callback) {
      if(method.fields.output) {
        outputs = outputs.concat(method.fields.output);
      }

      if(!method.scripts.output) {
        return callback(null, method);
      }
      runner.run(method.slug, 'output', {
        input: inputs
      }, function(err, customOutputs) {
        if(err) {
          callback(err);
        } else {
          try {
            chai.expect(customOutputs).to.be.flowxo.output.fields;
          } catch(e) {
            grunt.fail.fatal('Error in return from output.js script: ' + e.toString());
          }

          outputs = outputs.concat(customOutputs);
          callback(null, method);
        }
      });
    },

    // run.js
    function(method, callback) {
      runner.run(method.slug, 'run', {
        input: inputs
      }, function(err, result) {
        if(err) {
          callback(err);
        } else {
          callback(null, method, result);
        }
      });
    },

    // validation and output
    function(method, result, callback) {
      RunUtil.displayScriptData(grunt, result);
      RunUtil.displayScriptOutput(grunt, outputs, result);

      try {
        RunUtil.checkRunScriptResult(result, method);
      } catch(e) {
        CommonUtil.header(grunt, 'VALIDATION:', 'red');
        grunt.fail.fatal(e);
      }
      callback(null, method, result);
    }
  ], function(err, method, result) {
    if(err) {
      CommonUtil.header(grunt, 'Script Error', 'red');
      grunt.fail.fatal(err);
    }
    // Callback enough data so the caller can record
    // the run
    cb(err, result, method, inputs);
  });
};

RunUtil.runSingleScript = function(options, cb) {
  var grunt = options.grunt;
  var runner = options.runner;
  var service = options.service;
  var method, script;

  // Firstly, validate the service.
  // If it is not configured correctly, end.
  RunUtil.validateService(grunt, service);

  var fieldPromptOptions = {
    validateRequired: false
  };

  async.waterfall([
    // Get a method
    RunUtil.promptMethod.bind(RunUtil, service),
    // Get a service script
    function(userMethod, callback) {
      method = userMethod;
      RunUtil.promptScript(method, callback);
    },
    // Get some fields
    function(userScript, callback) {
      // If it's a run script, do some inputs
      script = userScript;
      if(userScript === 'run' && method.fields.input) {
        RunUtil.promptFields(method.fields.input, fieldPromptOptions, callback);
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
    RunUtil.displayScriptData(grunt, result);

    if(!grunt.option('no-check-outputs')) {
      if(script === 'run') {
        RunUtil.checkRunScriptResult(result, method);
      } else if(script === 'input') {
        chai.expect(result).to.be.flowxo.input.fields;
      } else if(script === 'output') {
        chai.expect(result).to.be.flowxo.output.fields;
      }
    }

    cb(err);
  });
};

module.exports = RunUtil;
