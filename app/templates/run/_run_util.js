'use strict';
var inquirer = require('inquirer');
var chalk = require('chalk');
var async = require('async');
var SDK = require('flowxo-sdk');
var chai = require('chai');
chai.use(SDK.Chai);
var RunUtil = {};

RunUtil.header = function(grunt, msg, color) {
  msg = color ? chalk[color](msg) : msg;
  var line = Array(msg.length + 1).join('-');
  line = color ? chalk[color](line) : line;

  grunt.log.subhead(msg);
  grunt.log.writeln(line);
};

RunUtil.displayScriptData = function(grunt, data) {
  RunUtil.header(grunt,'DATA:','green');
  grunt.log.writeln(chalk.cyan(JSON.stringify(data, null, 2)));

};

RunUtil.displayScriptOutput = function(grunt,method,data){
  // First create an indexed hash of fields
  var fieldsIdx = method.fields.output.reduce(function(data,f){
    data[f.key] = f;
    return data;
  },{});

  // Now go through the output and create a labeled version
  var dataLabelled = Object.keys(data).reduce(function(memo,key){
    memo[fieldsIdx.hasOwnProperty(key) ? fieldsIdx[key].label : '??UNKNOWN??'] = data[key];
    return memo;
  },{});

  RunUtil.header(grunt,'OUTPUT:','green');
  grunt.log.writeln(chalk.cyan(JSON.stringify(dataLabelled, null, 2)));
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

RunUtil.promptFields = function(inputs, cb) {
  var prompts = inputs.map(function(input) {

    var prompt = {
      name: input.key,
      message: input.label,
      type: 'input'
    };

    // Required
    if(input.required) {
      prompt.message = prompt.message + '*';
      prompt.validate = function(item) {
        return !!item;
      };
    }

    // Select type
    if(input.type === 'select') {
      prompt.type = 'list';
      prompt.choices = input.input_options.map(function(choice) {
        return {
          name: choice.label,
          value: choice.value
        };
      });
      if(!input.required) {
        prompt.choices.unshift({
          name: '(none)',
          value: ''
        });
      }
    } else if(input.type === 'datetime') {
      prompt.message += ' ⌚';
    } else if(input.type === 'boolean') {
      prompt.message += ' ☯';
    }

    prompt.message = prompt.message += ':';

    if(input.default) {
      prompt.default = input.default;
    }

    return prompt;
  });

  inquirer.prompt(prompts, function(result) {
    cb(null, result);
  });
};

RunUtil.run = function(options, cb) {

  var grunt = options.grunt;
  var runner = options.runner;
  var service = options.service;
  var method = options.method;

  var inputs = options.inputs || [],
    outputs = [];

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
        RunUtil.header(grunt, 'Method: ' + method.name);
        callback(null, method);
      } else {
        RunUtil.header(grunt, 'Method Selection');
        RunUtil.promptMethod(service, callback);
      }
    },

    // Static Inputs
    function(method, callback) {
      if(method.fields.input && method.fields.input.length) {
        RunUtil.header(grunt, 'Standard Input Fields');

        // If we've been given them, just set and move on
        if(options.inputs) {
          options.inputs.forEach(function(input) {
            if(!input.custom) {
              grunt.log.writeln(input.label + ': ' + input.value);
            }
          });
          // addInputsIfDefined(method.fields.input,options.standardInputs);
          return callback(null, method);
        }

        // Else prompt for them
        RunUtil.promptFields(method.fields.input, function(err, answers) {
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
      RunUtil.header(grunt, 'Custom Input Fields');
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
        if(options.inputs) {
          options.inputs.forEach(function(input) {
            if(input.custom) {
              grunt.log.writeln(input.label + ': ' + input.value);
            }
          });
          // addInputsIfDefined(customInputFields,options.customInputs,true);
          return callback(null, method);
        }

        // Else prompt for some
        RunUtil.promptFields(customInputFields, function(err, answers) {
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
          outputs = customOutputs;
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
      method.fields.output = (method.fields.output || []).concat(outputs);
      RunUtil.displayScriptData(grunt,result);
      RunUtil.displayScriptOutput(grunt,method,result);

      try{
        chai.expect(result).to.matchConfig(method);
      }catch(e){
        RunUtil.header(grunt,'VALIDATION:','red');
        grunt.fail.fatal(e);
      }
      RunUtil.header(grunt,'VALIDATION: Success','green');
      callback(null, method, result);
    }
  ], function(err, method, result) {
    if(err) {
      RunUtil.header(grunt, 'Script Error', 'red');
      grunt.fail.fatal(err);
    }
    // Callback enough data so the caller can record
    // the run
    cb(err, result, method, inputs);
  });
};

module.exports = RunUtil;
