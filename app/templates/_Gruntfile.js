// Generated on <%= (new Date).toISOString().split('T')[0] %> using <%= pkg.name %> <%= pkg.version %>
'use strict';
var crypto = require('crypto');
var express = require('express');
var session = require('express-session');
var inquirer = require('inquirer');
var fs = require('fs');
var SDK = require('flowxo-sdk');
var chalk = require('chalk');
var service = require('./lib');
var async = require('async');
var chai = require('chai');

chai.use(SDK.Chai);

/******************************************************************************
 * Global Vars
 ******************************************************************************/
var CREDENTIALS_FILENAME = 'credentials.json';
var OAUTH_SERVER_URL = process.env.OAUTH_SERVER_URL || 'http://flowxo-dev.cc';
var OAUTH_SERVER_PORT = process.env.OAUTH_SERVER_PORT || 9000;

var cloneObject = function(obj) {
  var cloned = {};
  for(var key in obj) {
    if(obj.hasOwnProperty(key)) {
      cloned[key] = obj[key];
    }
  }
  return cloned;
};

module.exports = function(grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  var logHeader = function(message) {
    grunt.log.subhead(message);
    grunt.log.writeln(Array(message.length + 1).join('-'));
  };

  // Credentials
  try {
    grunt.credentials = require('./' + CREDENTIALS_FILENAME);
  } catch(e) {
    grunt.credentials = {};
  }

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

  function promptMethod(cb) {

    // If we have been passed it in the command-line
    if(grunt.option('method')) {
      var slug = grunt.option('method');
      for(var i = 0; i < service.methods.length; i++) {
        if(service.methods[i].slug === slug) {
          cb(service.methods[i]);
        }
      }
      throw 'Unable to find method with slug ' + slug;
    }

    // First we need them to choose the script
    var methodPrompt = [{
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

    inquirer.prompt(methodPrompt, function(answers) {
      cb(null, answers.method);
    });
  }

  function promptInputs(inputs, cb) {
    var prompts = inputs.map(function(input) {
      var prompt = {
        name: input.key,
        message: input.label + ':'
      };

      if(input.type === 'select') {
        prompt.type = 'list';
        prompt.choices = input.input_options.map(function(c) {
          return {
            name: c.label,
            value: c.value
          };
        });
        if(!input.required) {
          prompt.choices.unshift({
            name: '(none)',
            value: ''
          });
        }
      } else if(input.type === 'text') {
        prompt.type = 'input';
      }

      // Make it required if necessary
      if(input.required) {
        prompt.message = prompt.message + '*';
        prompt.validate = function(item) {
          return !!item;
        };
      }

      // Support for default values
      if(input.default) {
        prompt.default = input.default;
      }

      return prompt;
    });

    inquirer.prompt(prompts, function(answers) {
      cb(null, answers);
    });
  }

  /**
   * Run a method from start to finish
   */
  grunt.registerTask('run', function() {
    // Check we have some methods to run
    if(service.methods.length === 0) {
      grunt.fail.fatal('You have no methods to run! Create new methods with `yo flowxo:method`');
    }
    var done = this.async();

    var runner = new SDK.ScriptRunner(service, {
      credentials: grunt.credentials
    });

    var runIt = function() {
      var inputs = {},
          outputs = [];

      async.waterfall([
        // Method Selection
        function(callback) {
          logHeader('Method Selection');
          promptMethod(callback);
        },

        // Static inputs
        function(method, callback) {
          if(method.fields.input && method.fields.input.length) {
            logHeader('Standard Input Fields');
            promptInputs(method.fields.input, function(err, answers) {
              if(err) {
                callback(err);
              } else {
                for(var a in answers) {
                  inputs[a] = answers[a];
                }
                callback(null, method);
              }
            });
          } else {
            callback(null, method);
          }
        },

        // input.js
        function(method, callback) {
          if(method.scripts.input) {
            logHeader('Custom Input Fields');
            runner.run(method.slug, 'input', {}, function(err, customInputs) {
              if(err) {
                return callback(err);
              }
              // Quick check that the fields are valid
              try {
                chai.expect(customInputs).to.be.flowxo.input.fields;
              } catch(e) {
                grunt.fail.fatal('Error in return from input.js script: ' + e.toString());
              }
              promptInputs(customInputs, function(err, answers) {
                if(err) {
                  callback(err);
                } else {
                  for(var a in answers) {
                    inputs[a] = answers[a];
                  }
                  callback(null, method);
                }
              });
            });
          } else {
            callback(null, method);
          }
        },

        // output.js
        function(method, callback) {
          if(method.scripts.output) {
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
          } else {
            callback(null, method);
          }
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

        // validation
        function(method, result, callback) {
          // We need to merge the defined outputs with the dynamic ones
          method.fields.output = (method.fields.output || []).concat(outputs);

          var err = null;
          // Commented out until we figure out what to do here
          /*try {
            chai.expect(result).to.matchConfig(method);
          } catch(e) {
            err = new Error('Result does not match config: ' + e.toString());
          }*/

          callback(err, result);
        }

      ], function(err, result) {
        if(err) {
          logHeader(chalk.red('Script Error'));
          grunt.log.writeln(chalk.red(err));
        }

        if(result) {
          logHeader('Script Output');
          grunt.log.writeln(chalk.cyan(JSON.stringify(result, null, 2)));
        }

        // Ask if we want to go again
        inquirer.prompt({
          type: 'confirm',
          name: 'again',
          message: 'Would you like to run another method?',
          default: true
        }, function(answers) {
          if(answers.again) {
            runIt();
          } else {
            done();
          }
        });
      });
    };

    runIt();
  });


  grunt.registerTask('run:single', 'Run a service method', function() {
    // Check we have some methods to run
    if(service.methods.length === 0) {
      grunt.fail.fatal('You have no methods to run! Create new methods with `yo flowxo:method`');
    }

    var done = this.async();

    // This will store the current state
    var state = {};

    var runner = new SDK.ScriptRunner(service, {
      credentials: grunt.credentials
    });

    var runPrompts = [{
      type: 'expand',
      name: 'run',
      message: 'Run again?',
      choices: [{
        key: 'r',
        name: 'Repeat with same parameters',
        value: 'repeat'
      }, {
        key: 'u',
        name: 'Update input parameters and run again',
        value: 'update'
      }, new inquirer.Separator(), {
        key: 'q',
        name: 'Quit',
        value: 'quit'
      }]
    }];

    var runMethod = function(cb) {
      return runner.run(state.method.slug, state.script, state.options || {}, function(err, data) {
        if(err) {
          grunt.fail.fatal(err);
        }
        output(data);

        // Unless we have the --no-check-outputs option on
        if(!grunt.option('no-check-outputs')) {
          var chai = require('chai');
          chai.use(SDK.Chai);
          if(state.script === 'run') {
            chai.expect(data).to.matchConfig(state.method);
          } else if(state.script === 'input') {
            chai.expect(data).to.be.flowxo.input.fields;
          } else if(state.script === 'output') {
            chai.expect(data).to.be.flowxo.output.fields;
          }
        }
        cb();
      });
    };

    var output = function(data) {
      grunt.log.writeln('Script Output:');
      grunt.log.writeln(chalk.cyan(JSON.stringify(data, null, 2)));
    };

    var runManager = function(cb) {
      runMethod(function() {
        inquirer.prompt(runPrompts, function(runAnswers) {
          switch(runAnswers.run) {
            case 'repeat':
              runManager(cb);
              break;
            case 'update':
              doFieldPrompt(function() {
                runManager(cb);
              });
              break;
            default:
              cb();
          }
        });
      });
    };

    var doScriptPrompt = function(cb) {

      if(grunt.option('script')) {
        var script = grunt.option('script');
        if(state.method.scripts.hasOwnProperty(script)) {
          state.script = script;
          return doFieldPrompt(cb);
        } else {
          throw 'Unable to find script ' + script + ' for method ' + state.method.slug;
        }
      }

      var scriptPrompt = [{
        type: 'list',
        name: 'script',
        message: 'Select a script',
        choices: Object.keys(state.method.scripts)
      }];

      inquirer.prompt(scriptPrompt, function(answers) {
        state.script = answers.script;
        doFieldPrompt(cb);
      });
    };

    var doFieldPrompt = function(cb) {
      if(state.script === 'run' && state.method.fields && state.method.fields.input) {
        var fieldPrompts = state.method.fields.input.map(function(f) {
          var message = '[' + f.label + (f.required ? ' - required]' : ']');
          if(!f.type || f.type === 'text') {
            return {
              type: 'input',
              name: f.key,
              message: message,
              validate: function(input) {
                return f.required ? input && input.length > 0 : true;
              }
            };
          } else if(f.type === 'select') {
            return {
              type: 'list',
              name: f.key,
              message: message,
              choices: f.input_options.map(function(c) {
                return {
                  name: c.label,
                  value: c.value
                };
              })
            };
          }
        });
        inquirer.prompt(fieldPrompts, function(answers) {
          state.options = {
            input: answers
          };
          cb();
        });
      } else {
        cb();
      }
    };

    promptMethod(function(err, method) {
      state.method = method;
      doScriptPrompt(function() {
        runManager(done);
      });
    });

  });

  var getStrategy = function(service, options, callback) {
    if(!service.auth.strategy) {
      grunt.fail.fatal('Unable to load strategy - please check you have defined a valid strategy in your `index.js` file');
    }

    return new service.auth.strategy(options, callback);
  };

  // Map of authentication type handlers
  var authHandlers = {};
  /**
   * Handler for Credentials Authentication Types
   */
  authHandlers.credentials = function(service, cb) {
    var prompts = service.auth.fields.map(function(f) {
      var p = {
        name: f.key,
        message: f.label
      };

      if(f.type === 'text') {
        p.type = 'input';
      } else if(f.type === 'select') {
        p.type = 'list';
        p.choices = f.input_options.map(function(i) {
          return {
            name: i.label,
            value: i.value
          };
        });
      }
      return p;
    });

    inquirer.prompt(prompts, function(answers) {
      // Ping the endpoint to ensure the credentials are valid
      service.runScript('ping', {
        credentials: answers
      }, function(err) {
        if(err) {
          grunt.fail.fatal('Invalid credentials: ' + err);
        }
        cb(answers);
      });
    });
  };

  authHandlers.oauth = function(service, formatCreds, cb) {
    var open = require('open');
    var url = require('url');
    var passport = require('passport');

    var app = express();
    app.use(session({
      secret: crypto.randomBytes(64).toString('hex'),
      resave: false,
      saveUninitialized: true
    }));

    var name = service.slug;
    var route = '/auth/service/' + name;
    var cbRoute = route + '/callback';

    // Calculate the callbackURL for the request
    var serverUrl = url.parse(OAUTH_SERVER_URL);

    var callbackURL = url.format({
      protocol: serverUrl.protocol,
      hostname: serverUrl.hostname,
      port: OAUTH_SERVER_PORT,
      pathname: cbRoute
    });

    var options = cloneObject(service.auth.options);
    options.callbackURL = callbackURL;

    var strategy = getStrategy(service, options, formatCreds);

    passport.use(name, strategy);
    app.use(passport.initialize());

    app.get(route, passport.authorize(name, service.auth.params));

    app.get(cbRoute, passport.authorize(name), function(req, res) {
      res.status(200).send('Thank you. You may now close this window.');
      cb(req.account);
    });

    app.listen(OAUTH_SERVER_PORT);

    var userUrl = url.format({
      protocol: serverUrl.protocol,
      hostname: serverUrl.hostname,
      port: OAUTH_SERVER_PORT,
      pathname: route
    });
    grunt.log.writeln(['Opening OAuth authentication in browser. Please confirm in browser window to continue.']);
    open(userUrl);
  };

  authHandlers.oauth1 = function(service, cb) {
    var formatter = function(token, token_secret, profile, done) {
      done(null, {
        token: token,
        token_secret: token_secret,
        consumer_key: service.auth.options.consumerKey,
        consumer_secret: service.auth.options.consumerSecret,
        profile: profile
      });
    };

    authHandlers.oauth(service, formatter, cb);
  };

  /**
   * Handler for OAuth2
   */
  authHandlers.oauth2 = function(service, cb) {
    var formatter = function(access_token, refresh_token, profile, done) {
      done(null, {
        access_token: access_token,
        refresh_token: refresh_token,
        profile: profile
      });
    };

    authHandlers.oauth(service, formatter, cb);
  };

  var storeCredentials = function(credentials) {
    grunt.credentials = credentials;
    fs.writeFileSync(CREDENTIALS_FILENAME, JSON.stringify(grunt.credentials));
  };

  grunt.registerTask('authTask', 'Create an authentication', function() {
    var service = require('./');
    var done = this.async();

    var hdlr = authHandlers[service.auth.type];
    hdlr(service, function(auth) {
      storeCredentials(auth);
      done();
    });
  });

  grunt.registerTask('authRefreshTask', 'Refresh an access token', function() {
    var service = require('./');
    var done = this.async();
    var refresh = require('passport-oauth2-refresh');

    if(!grunt.credentials) {
      grunt.fail.fatal('Unable to load existing authentication to refresh - please check you have an ' + CREDENTIALS_FILENAME + ' file in the root of your service');
    }

    var options = {
      clientID: service.auth.options.clientID,
      clientSecret: service.auth.options.clientSecret,
    };

    var callback = function(access_token, refresh_token, profile, done) {
      done(null, {
        access_token: access_token,
        refresh_token: refresh_token,
        profile: profile
      });
    };

    var strategy = getStrategy(service, options, callback);
    refresh.use(strategy);

    refresh.requestNewAccessToken(strategy.name, grunt.credentials.access_token, function(err, accessToken, refreshToken) {
      if(err) {
        grunt.fail.fatal('Generatring access token failed:' + err);
      }

      if(typeof refreshToken !== 'undefined') {
        grunt.credentials.refresh_token = refreshToken;
      }

      grunt.credentials.access_token = accessToken;
      storeCredentials(grunt.credentials);
      done();
    });
  });

  grunt.registerTask('auth:refresh', ['env', 'authRefreshTask']);
  grunt.registerTask('auth', ['env', 'authTask']);
  grunt.registerTask('test', ['env', 'mochaTest']);
  grunt.registerTask('default', ['env', 'jshint', 'test', 'watch']);
};
