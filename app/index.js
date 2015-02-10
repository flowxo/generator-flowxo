'use strict';
var util = require('util');
var fs = require('fs');
var path = require('path');
var yeoman = require('yeoman-generator');
var _ = require('lodash');
var chalk = require('chalk');
var FlowXOUtils = require('../utils');

var FlowXOGenerator = module.exports = function FlowXOGenerator(args, options) {
  yeoman.generators.Base.apply(this,arguments);
  // Greet the user
  console.log(FlowXOUtils.greeting);

  this.argument('service',{type: String, required: true});
  this.serviceName = 'flowxo-services-' + this.service;
  this.root = process.cwd();
  this.options = options;
  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname,'../package.json')));
  this.destinationRoot(this.serviceName);

  this.on('end',function(){
  });

};

util.inherits(FlowXOGenerator,yeoman.generators.Base);

FlowXOGenerator.prototype.coreFiles = function coreFiles(){
  this.template('_gitignore','.gitignore');
  this.template('_package.json','package.json');
  this.template('_Gruntfile.js','Gruntfile.js');
};

FlowXOGenerator.prototype.installDeps = function installDeps(){
  this.installDependencies({ bower: false, skipInstall: this.options['skip-install'] });
};
