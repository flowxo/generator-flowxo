'use strict';

var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var _ = require('lodash');
var chalk = require('chalk');
var mkdirp = require('mkdirp');
var wiring = require('html-wiring');
var FlowXOUtils = require('../utils');
var pjson = require('../package.json');
var updateNotifier  = require('update-notifier');
var stripAnsi = require('strip-ansi');

var SERVICES_ROOT = 'flowxo-services-';

var getUpdateMessage = function(update) {
  var updateMessagePart1 = 'Update available: '  + chalk.green(update.latest) + chalk.gray(' (current: ' + pjson.version + ')');
  var updateMessagePart2 = 'Run ' + chalk.cyan('npm update -g ' + pjson.name) + ' to update.';

  var part1Len = stripAnsi(updateMessagePart1).length,
      part2Len = stripAnsi(updateMessagePart2).length,
      len;
  if(part1Len > part2Len) {
    updateMessagePart2 += Array(part1Len - part2Len + 1).join(' ');
    len = part1Len + 1;
  } else if(part2Len > part1Len) {
    updateMessagePart1 += Array(part2Len - part1Len + 1).join(' ');
    len = part2Len + 1;
  }
  return [
    chalk.yellow(' ┌──' + Array(len).join('─') + '──┐'),
    chalk.yellow(' │  ') + updateMessagePart1 + chalk.yellow('  │'),
    chalk.yellow(' │  ') + updateMessagePart2 + chalk.yellow('  │'),
    chalk.yellow(' └──' + Array(len).join('─') + '──┘')
  ].join('\n');
};

var FlowXOGenerator = module.exports = function FlowXOGenerator() {
  yeoman.generators.Base.apply(this, arguments);

  this.option('debug');

  // Checks for available update and returns an instance
  var notifier = updateNotifier({
    pkg: pjson,
    updateCheckInterval: 1000 * 60 // Every hour
  });

  // Greet the user
  this.log(FlowXOUtils.greeting);

  if(this.options.debug) {
    this.log(chalk.gray('version: ' + pjson.version + '\n'));
  }

  if(notifier.update) {
    this.log(getUpdateMessage(notifier.update));
  }

  this.argument('service', {
    type: String,
    required: false
  });

  this.pkg = JSON.parse(wiring.readFileAsString(path.join(__dirname, '../package.json')));
  this.on('end', function() {
    this.log(chalk.cyan('\nYour service has been generated in the ' + this.serviceName + ' folder.\n'));
    this.log(chalk.cyan(FlowXOUtils.messages.whatNext[this.auth.type]));
  });

};

util.inherits(FlowXOGenerator, yeoman.generators.Base);

FlowXOGenerator.prototype.prompting = function() {
  var done = this.async();
  var self = this;
  var prompts = FlowXOUtils.prompts.service;
  this.prompt(prompts, function(props) {
    self.name = props.name;
    self.slug = _.snakeCase(self.name);
    self.slugUpperCased = self.slug.toUpperCase();
    self.auth = {
      type: props.auth_type
    };
    self.serviceName = SERVICES_ROOT + _.kebabCase(self.name.toLowerCase());
    self.destinationRoot(self.serviceName);
    done();
  });

};

FlowXOGenerator.prototype.authPrompting = function authPrompting() {
  var done = this.async();
  var self = this;

  if(this.auth.type === 'credentials') {
    this.log(chalk.bgGreen('You now need to define the necessary credential fields for the service connection.'));
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
  this.template('_env', '.env');

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
