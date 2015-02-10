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

  this.argument('name',{type: String, required: false});
  this.root = process.cwd();
  this.sourceRoot(path.join(__dirname,'../templates'));
  this.options = options;
  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname,'../package.json')));
};

util.inherits(FlowXOGenerator,yeoman.generators.Base);

FlowXOGenerator.prototype.coreFiles = function coreFiles(){
  this.template('core/_bower.json','bower.json');
  this.template('core/_bowerrc','.bowerrc');
  this.template('core/_gitignore','.gitignore');
  this.template('core/_package.json','package.json');
  this.template('core/_Gruntfile.js','Gruntfile.js');
  this.template('core/_jshintrc','.jshintrc');
  this.template('core/_jshintrc','test/.jshintrc');
};

FlowXOGenerator.prototype.installDeps = function installDeps(){
  this.installDependencies({ skipInstall: this.options['skip-install'] });
};
