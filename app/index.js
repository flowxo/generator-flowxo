'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var _ = require('lodash');
var chalk = require('chalk');
var FlowXOUtils = require('../utils');

var SERVICES_ROOT = 'flowxo-services-';

var FlowXOGenerator = module.exports = function FlowXOGenerator() {
  yeoman.generators.Base.apply(this, arguments);

  // Greet the user
  console.log(FlowXOUtils.greeting);

  this.argument('service', {
    type: String,
    required: false
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
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
    self.auth = {
      type: props.auth_type
    };
    self.serviceName = SERVICES_ROOT + _.kebabCase(self.name);
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
  this.template('_package.json', 'package.json');
  this.template('_Gruntfile.js', 'Gruntfile.js');
  this.template('_README.md', 'README.md');
  this.template('_env', '.env');

  // Lib
  this.mkdir('lib');
  if(this.auth.type === 'credentials') {
    this.template('_ping.js', 'lib/ping.js');
  }

  this.template('_index.js', 'lib/index.js');

  // Methods
  this.mkdir('lib/methods');

  // Run
  this.mkdir('run');
  this.template('run/_run_auth.js','run/run_auth.js');
  this.template('run/_run_util.js','run/run_util.js');

  this.mkdir('run/tasks');
  this.template('run/tasks/_auth.js','run/tasks/auth.js');
  this.template('run/tasks/_run.js','run/tasks/run.js');
  this.template('run/tasks/_run_record.js','run/tasks/run_record.js');
  this.template('run/tasks/_run_replay.js','run/tasks/run_replay.js');
  this.template('run/tasks/_run_single.js','run/tasks/run_single.js');

  // Tests
  this.mkdir('tests');
  this.template('_bootstrap.js', 'tests/bootstrap.js');
  this.template('_helpers.js', 'tests/helpers.js');
  this.template('_service.spec.js', 'tests/service.spec.js');
  this.template('_jshintrc_test', 'tests/.jshintrc');
};

FlowXOGenerator.prototype.installDeps = function installDeps() {
  this.installDependencies({
    bower: false,
    skipInstall: this.options['skip-install'],
    skipMessage: true
  });
};
