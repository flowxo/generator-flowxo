'use strict';

var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var _ = require('lodash');
var chalk = require('chalk');
var mkdirp = require('mkdirp');
var wiring = require('html-wiring');
var FlowXOUtils = require('../utils');
var pkg = require('../package.json');
var updateNotifier  = require('update-notifier');

var SERVICES_ROOT = 'flowxo-services-';

var FlowXOGenerator = module.exports = function FlowXOGenerator() {
  yeoman.generators.Base.apply(this, arguments);

  this.option('debug');

  // Greet the user
  this.log(FlowXOUtils.greeting);

  if(this.options.debug) {
    this.log(chalk.gray('version: ' + pkg.version + '\n'));
  }

  // Checks for generator update and prints a notification
  updateNotifier({ pkg: pkg })
    .notify({ defer: false });

  this.argument('service', {
    type: String,
    required: false
  });

  this.pkg = JSON.parse(wiring.readFileAsString(path.join(__dirname, '../package.json')));
  this.on('end', function() {
    this.log(chalk.cyan('\nYour service has been generated in the ' + this.module + ' folder.\n'));
    this.log(chalk.cyan(FlowXOUtils.messages.whatNext[this.auth.type]));
  });

};

util.inherits(FlowXOGenerator, yeoman.generators.Base);

FlowXOGenerator.prototype.prompting = function() {
  var done = this.async();
  var self = this;
  var prompts = FlowXOUtils.prompts.service;
  this.prompt(prompts, function(props) {
    var nameLowerCased = props.name.toLowerCase();
    var slug = _.kebabCase(nameLowerCased);
    var snake = _.snakeCase(nameLowerCased);

    self.name = props.name;
    self.slug = slug;
    self.envSlug = snake.toUpperCase();
    self.help = props.help || '';
    self.auth = {
      type: props.auth_type
    };
    self.isOAuth = props.auth_type.indexOf('oauth') === 0;
    self.hasAuth = props.auth_type !== 'none';
    self.module = SERVICES_ROOT + slug;
    self.destinationRoot(self.module);
    done();
  });

};

FlowXOGenerator.prototype.authPrompting = function authPrompting() {
  var done = this.async();
  var self = this;

  if(this.auth.type === 'credentials') {
    this.log(chalk.green('You should now define the necessary credential fields for the service connection.'));
    FlowXOUtils.promptUtils.repeatedPrompt.call(this, 'field', FlowXOUtils.prompts.credentials, function(fields) {
      self.auth.fields = fields;
      done();
    });
  } else {
    done();
  }
};

FlowXOGenerator.prototype.coreFiles = function coreFiles() {
  // Root Boilerplate
  this.template('_gitignore', '.gitignore');
  this.template('_jshintrc', '.jshintrc');
  this.template('_jsbeautifyrc', '.jsbeautifyrc');
  this.template('_editorconfig', '.editorconfig');
  this.template('_package.json', 'package.json');
  this.template('_Gruntfile.js', 'Gruntfile.js');
  this.template('_CHANGELOG.md', 'CHANGELOG.md');
  this.template('_README.md', 'README.md');
  if(this.isOAuth) {
    this.template('_env', '.env');
  }

  // Lib
  mkdirp('lib');
  if(this.auth.type === 'credentials') {
    this.template('_ping.js', 'lib/ping.js');
  }

  this.template('_index.js', 'lib/index.js');

  // Methods
  mkdirp('lib/methods');

};

FlowXOGenerator.prototype.installDeps = function installDeps() {
  this.installDependencies({
    bower: false,
    skipInstall: this.options['skip-install'],
    skipMessage: true
  });
};
