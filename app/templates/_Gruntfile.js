// Generated on <%= (new Date).toISOString().split('T')[0] %> using <%= pkg.name %> <%= pkg.version %>
'use strict';
var express = require('express');
var inquirer = require('inquirer');
var fs = require('fs');
var service = require('./');

var OAUTH_CB_PORT = 9000;

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
  			files: ['methods/**/*.js','tests/**/*.spec.js'],
  			tasks: ['test']
  		}
  	}
  });

  grunt.registerTask('run','Run a service method',function(method){

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
        // Load the provider configuration
        var provider = require('./provider.json');
        // Set the callback URL
        var cbUrl = provider.server.callback = '/handle_oauth_response';

        var Grant = require('grant').express();
        var grant = new Grant(provider);
        var open = require('open');
        var url = require('url');
        var app = express();
        app.use(grant);

        app.get(cbUrl,function(req,res){
                console.log(req.query);
                res.send(JSON.stringify(res.query,null,2));
                res.status(200).send('Thankyou. You may now close this browser window');
                cb(req.query);
        });

        var serverUrl = url.parse(url.format({
                protocol: provider.server.protocol,
                host: provider.server.host})
        );

        app.listen(serverUrl.port || OAUTH_CB_PORT);
        var url = url.format({
                protocol: provider.server.protocol || 'http',
                hostname: serverUrl.hostname,
                port: serverUrl.port,
                pathname: '/connect/' + provider.name});
        grunt.log.writeln(["Opening OAuth authentication in browser. Please confirm in browser window to continue."]);
        open(url);
  };



  grunt.registerTask('auth','Create an authentication',function(){
  	var done = this.async();
  	function writeAuth(auth){
  		fs.writeFileSync('./auth.json',JSON.stringify(auth));
  		done();
  	}

  	var hdlr;
  	if(service.auth.type === 'credentials')
  		hdlr =credentialsHandler;
  	else
  		hdlr = oauthHandler;

  	hdlr(writeAuth);
  });

  grunt.registerTask('test',['mochaTest']);
  grunt.registerTask('default',['test','watch']);
};
