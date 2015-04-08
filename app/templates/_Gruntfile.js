// Generated on <%= (new Date).toISOString().split('T')[0] %> using <%= pkg.name %> <%= pkg.version %>
'use strict';
var crypto = require('crypto');
var express = require('express');
var session = require('express-session');
var inquirer = require('inquirer');
var fs = require('fs');
var SDK = require('flowxo-sdk');
var chalk = require('chalk');

/******************************************************************************
 * Global Vars
 ******************************************************************************/
var CREDENTIALS_FILENAME = 'credentials.json';
var OAUTH_SERVER_PORT = 9000;

var cloneObject = function(obj) {
  var cloned = {};
  for (var key in obj) {
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
        files: ['index.js', 'methods/**/*.js', 'tests/**/*.spec.js'],
        tasks: ['jshint', 'test']
      }
    },
    jshint: {
      options: {
        jshintrc: true,
        reporter: require('jshint-stylish')
      },
      source: {
        src: ['Gruntfile.js', 'index.js', 'ping.js', 'provider.js', 'methods/**/*.js']
      },
      tests: {
        src: ['tests/**/*.js'],
      }
    }
  });

  grunt.registerTask('run', 'Run a service method', function() {
    var service = require('./');
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
      return runner.run(state.method.slug, state.script, state.options, function(err, data) {
        output(data);
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

    var doMethodPrompt = function(cb) {

      // If we have been passed it in the command-line
      if(grunt.option('method')) {
        var slug = grunt.option('method');
        for(var i = 0; i < service.methods.length; i++) {
          if(service.methods[i].slug === slug) {
            state.method = service.methods[i];
            return doScriptPrompt(cb);
          }
        }
        throw 'Unable to find method with slug ' + slug;
      }

      // First we need them to choose the script
      var methodPrompt = [{
        type: 'list',
        name: 'method',
        message: 'Select a method to run',
        choices: service.methods.map(function(m) {
          return {
            name: m.name,
            value: m
          };
        })
      }];

      inquirer.prompt(methodPrompt, function(answers) {
        state.method = answers.method;
        doScriptPrompt(cb);
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

    doMethodPrompt(function() {
      runManager(done);
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
      cb(answers);
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
    var serverUrl = url.parse(process.env.BASE_URL);

    var callbackURL = url.format({
      protocol: serverUrl.protocol,
      hostname: serverUrl.hostname,
      port: serverUrl.port,
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

    app.listen(serverUrl.port || OAUTH_SERVER_PORT);

    var userUrl = url.format({
      protocol: serverUrl.protocol,
      hostname: serverUrl.hostname,
      port: serverUrl.port,
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
