// Generated on <%= (new Date).toISOString().split('T')[0] %> using <%= pkg.name %> <%= pkg.version %>
'use strict';
var express = require('express');
var inquirer = require('inquirer');
var fs = require('fs');
var service = require('./');
var SDK = require('flowxo-sdk');
var chalk = require('chalk');

/******************************************************************************
 * Global Vars
******************************************************************************/
var AUTH_FILENAME = 'auth.json';
var OAUTH_SERVER_PORT = 9000;

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({
  	mochaTest:{
  		test:{
  			options:{
  				reporter: 'spec',
  				quiet: false,
  				clearRequireCache: false,
  				require: './tests/bootstrap'
  			},
  			src: ['tests/**/*.spec.js']
  		}
  	},
  	watch:{
  		js:{
  			options:{
  				spawn: true,
  				interrupt: false,
  				debounceDelay: 250
  			},
  			files: ['index.js','methods/**/*.js','tests/**/*.spec.js'],
  			tasks: ['jshint','test']
  		}
  	},
    jshint:{
      options:{
        jshintrc: true,
        reporter: require('jshint-stylish')
      },
      source:{
        src: ['Gruntfile.js','index.js','ping.js','provider.js','methods/**/*.js']
      },
      tests:{
        src: ['tests/**/*.js'],
      }
    }
  });

  grunt.registerTask('_run','Run a service method',function(){
    var done = this.async();

    // This will store the current state
    var state = {};

    var runner = new SDK.ScriptRunner(service,{auth: grunt.auth});

    var runPrompts = [{
      type: 'expand',
      name: 'run',
      message: 'Run again?',
      choices:[{
        key: 'r',
        name: 'Repeat with same parameters',
        value: 'repeat'
      },{
        key: 'u',
        name: 'Update input parameters and run again',
        value: 'update'
      },new inquirer.Separator(), {
        key: 'q',
        name: 'Quit',
        value: 'quit'
      }]
    }];

    var runMethod = function(cb){
      return runner.run(state.method.slug,state.script,state.options,function(err,data){
        output(data);
        cb();
      });
    };

    var output = function(data){
      grunt.log.writeln('Script Output:');
      grunt.log.writeln(chalk.cyan(JSON.stringify(data,null,2)));
    };

    var runManager = function(cb){
      runMethod(function(){
        inquirer.prompt(runPrompts,function(runAnswers){
          switch(runAnswers.run){
            case 'repeat':
              runManager(cb);
              break;
            case 'update':
              doFieldPrompt(function(){
                runManager(cb);
              });
              break;
            default:
              cb();
          }
        });
      });
    };

    var doMethodPrompt = function(cb){
      // First we need them to choose the script
      var methodPrompt = [{
        type: 'list',
        name: 'method',
        message: 'Select a method to run',
        choices: service.methods.map(function(m){
          return {name: m.name, value: m};
        })
      }];

      inquirer.prompt(methodPrompt,function(answers){
        state.method = answers.method;
        doScriptPrompt(cb);
      });
    };

    var doScriptPrompt = function(cb){
      var scriptPrompt = [{
        type: 'list',
        name: 'script',
        message: 'Select a script',
        choices: Object.keys(state.method.scripts)
      }];

      inquirer.prompt(scriptPrompt,function(answers){
        state.script = answers.script;
        doFieldPrompt(cb);
      });
    };

    var doFieldPrompt = function(cb){
      if(state.script === 'run' && state.method.fields && state.method.fields.input){
        var fieldPrompts = state.method.fields.input.map(function(f){
          var message = '[' + f.label + (f.required ? ' - required]' : ']');
          if(!f.type || f.type === 'text'){
            return {
              type: 'input',
              name: f.key,
              message: message,
              validate: function(input){
                return f.required ? input && input.length > 0 : true;
              }
            };
          }else if(f.type === 'select'){
            return {
              type: 'list',
              name: f.key,
              message: message,
              choices: f.input_options.map(function(c){
                return { name: c.label, value: c.value };
              })
            };
          }
        });
        inquirer.prompt(fieldPrompts,function(answers){
          state.options = { input: answers };
          cb();
        });
      }else{
        cb();
      }
    };

    doMethodPrompt(function(){
      runManager(done);
    });

  });

  /**
   * Handler for Credentials Authentication Types
   */
  var credentialsHandler = function(cb){
  	var prompts = service.auth.fields.map(function(f){
  		var p = {
  			name: f.key,
  			message: f.label
  		};

  		if(f.type === 'text'){
  			p.type = 'input';
  		}else if(f.type === 'select'){
  			p.type = 'list';
  			p.choices = f.input_options.map(function(i){
  				return {name: i.label, value: i.value};
  			});
  		}
  		return p;
  	});

  	inquirer.prompt(prompts,function(answers){
  		cb(answers);
  	});
  };

  /**
   * Handler for OAuth Authentication Types
   */
  var oauthHandler = function(cb){
        var open = require('open');
        var url = require('url');
        var passport = require('passport');

        var app = express();
        var provider = service.auth.authProvider;

        var name = provider.name;
        var route = '/connect/' + name;
        var cbRoute = route + '/callback';

        // Calculate the callbackURL for the request
        var serverUrl = url.parse(process.env.BASE_URL);

        var callbackURL = url.format({
                protocol: serverUrl.protocol,
                hostname: serverUrl.hostname,
                port: serverUrl.port,
                pathname: cbRoute
        });

        var options = {
          clientID: provider.clientId,
          clientSecret: provider.clientSecret,
          callbackURL: callbackURL
        };

        var callback = function(access_token, refresh_token, profile, done){
          done(null,{
            access_token: access_token,
            refresh_token: refresh_token,
            profile: profile
          });
        };

        var strategy = new provider.strategy(options,callback);

        passport.use(name,strategy);
        app.use(passport.initialize());

        app.get(route,passport.authorize(name,provider.params));
        app.get(cbRoute,passport.authorize(name),function(req,res){
          res.status(200).send('Thankyou. You may now close this window.');
          cb(req.account);
        });

        app.listen(serverUrl.port || OAUTH_SERVER_PORT);

        var userUrl = url.format({
                protocol: serverUrl.protocol,
                hostname: serverUrl.hostname,
                port: serverUrl.port,
                pathname: route});
        grunt.log.writeln(['Opening OAuth authentication in browser. Please confirm in browser window to continue.']);
        open(userUrl);
  };

  var writeAuthentication = function(auth){
        fs.writeFileSync(AUTH_FILENAME,JSON.stringify(auth));
  };

  grunt.registerTask('auth','Create an authentication',function(){
  	var done = this.async();

  	var hdlr;
  	if(service.auth.type === 'credentials'){
  		hdlr =credentialsHandler;
    }
  	else{
  		hdlr = oauthHandler;
    }

  	hdlr(function(auth){
      writeAuthentication(auth);
      done();
    });
  });

  grunt.registerTask('auth:load',function(){
    try{
      grunt.auth = require('./'+AUTH_FILENAME);
    }catch(e){

    }
  });

  grunt.registerTask('auth:refresh','Refresh an access token',function(){
    var done = this.async();
    var refresh = require('passport-oauth2-refresh');
    var provider = service.auth.authProvider;
    var auth;

    try{
      auth = require('./'+AUTH_FILENAME);
    }catch(e){
      grunt.fail.fatal('Unable to load existing authentication to refresh - please check you have an ' + AUTH_FILENAME + ' file in the root of your service');
    }

    var options = {
      clientID: provider.clientId,
      clientSecret: provider.clientSecret,
    };

    var callback = function(access_token, refresh_token, profile, done){
      done(null,{
        access_token: access_token,
        refresh_token: refresh_token,
        profile: profile
      });
    };

    var strategy = new provider.strategy(options,callback);
    refresh.use(strategy);

    refresh.requestNewAccessToken(strategy.name,auth.access_token,function(err,accessToken,refreshToken){
      if(err){
        grunt.fail.fatal('Generatring access token failed:' + err);
      }

      if(typeof refreshToken !== 'undefined'){
        auth.refresh_token = refreshToken;
      }

      auth.access_token = accessToken;
      writeAuthentication(auth);
      done();
    });
  });

  grunt.registerTask('run',['auth:load','_run']);
  grunt.registerTask('test',['mochaTest']);
  grunt.registerTask('default',['jshint','test','watch']);
};
