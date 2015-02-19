'use strict';
var util = require('util');
var fs = require('fs');
var path = require('path');
var yeoman = require('yeoman-generator');
var _ = require('lodash');
var chalk = require('chalk');
var FlowXOUtils = require('../utils');

var SERVICES_ROOT = 'flowxo-services-';



var FlowXOGenerator = module.exports = function FlowXOGenerator(args, options) {
  yeoman.generators.Base.apply(this,arguments);
  // Greet the user
  console.log(FlowXOUtils.greeting);

  this.argument('service',{type: String, required: false});

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname,'../package.json')));
  this.on('end',function(){
  });

};

util.inherits(FlowXOGenerator,yeoman.generators.Base);

FlowXOGenerator.prototype.prompting = function(){
  var done = this.async();
  var self = this;
  var prompts = FlowXOUtils.prompts.service;
  this.prompt(prompts,function(props){
    self.name = props.name;
    self.slug = _.snakeCase(self.name);
    self.auth = {
      type: props.auth_type
    };
    self.serviceName = SERVICES_ROOT + self.name.toLowerCase();
    self.destinationRoot(self.serviceName);
    done();
  });

};

FlowXOGenerator.prototype.authPrompting = function authPrompting(){
  var done = this.async();
  var self = this;

  var prompts;
  if(this.auth.type === 'oauth'){
    this.auth.strategy = '';
    this.auth.params = {};
    done();
  }else if(this.auth.type === 'credentials'){
    FlowXOUtils.promptUtils.repeatedPrompt.call(this,'field',FlowXOUtils.prompts.credentials,function(fields){
      self.auth.fields = fields;
      done();
    });
  }
};

FlowXOGenerator.prototype.coreFiles = function coreFiles(){
  this.template('_gitignore','.gitignore');
  this.template('_package.json','package.json');
  this.template('_Gruntfile.js','Gruntfile.js');
  this.template('_index.js','index.js');
  this.mkdir('methods');
  this.mkdir('tests');
  this.template('_bootstrap.js','tests/bootstrap.js');
  this.template('_service.spec.js','tests/service.spec.js');

  if(this.auth.type === 'oauth'){
    this.template('_provider.js','provider.js');
  }
};

FlowXOGenerator.prototype.installDeps = function installDeps(){
  this.installDependencies({ bower: false, skipInstall: this.options['skip-install'] });
};
