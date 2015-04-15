'use strict';

var AuthUtil = require('../utils/auth');

var acquire = function(grunt, service, done) {
  var hdlr = AuthUtil.handlers[service.auth.type];
  if(!hdlr) {
    grunt.fail.fatal('Cannot authorize: no handler found for type ' + service.auth.type + '. Are you sure this is an OAuth service?');
  }

  hdlr(grunt, service, function(auth) {
    AuthUtil.storeCredentials(auth);
    done();
  });
};

var refresh = function(grunt, service, done) {
  // Check this is oauth2
  if(service.auth.type !== 'oauth2') {
    grunt.fail.fatal('Only able to refresh OAuth2 services.');
  }

  if(!grunt.credentials) {
    grunt.fail.fatal('Unable to load existing authentication to refresh');
  }

  AuthUtil.refresh(service, grunt.credentials, function(err, newCredentials) {
    AuthUtil.storeCredentials(newCredentials);
    done();
  });
};

module.exports = function(grunt) {
  grunt.registerTask('authTask', 'Create a set of authentication credentials', function() {
    var service = grunt.getService();
    var done = this.async();

    if(grunt.option('refresh')) {
      refresh(grunt, service, done);

    } else {
      acquire(grunt, service, done);
    }
  });
};
