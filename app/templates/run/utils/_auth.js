'use strict';

var open = require('open'),
    express = require('express'),
    session = require('express-session'),
    crypto = require('crypto'),
    url = require('url'),
    passport = require('passport'),
    fs = require('fs'),
    refresh = require('passport-oauth2-refresh');

var CommonUtil = require('./common');

var CREDENTIALS_FILENAME = 'credentials.json';

var AuthUtil = {};
AuthUtil.handlers = {};

/**
 * Return a clone of an object
 */
var cloneObject = function(obj) {
  var cloned = {};
  for(var key in obj) {
    if(obj.hasOwnProperty(key)) {
      cloned[key] = obj[key];
    }
  }
  return cloned;
};

/**
 * Generic handler for OAuth
 */
AuthUtil.handlers.oauth = function(grunt, service, envs, formatCreds, cb) {
  if(!service.auth.strategy) {
    grunt.fail.fatal('Unable to load strategy - please check you have a valid' +
    ' strategy defined in your `index.js` file.');
  }

  var options = cloneObject(service.auth.options);

  // Check env vars are all present
  envs.forEach(function(env) {
    if(!options[env.option]) {
      grunt.fail.fatal('Unable to authenticate: no ' + env.option + ' defined. Did you remember to fill in your ' + env.key + ' in the .env file?');
    }
  });

  var name = service.slug;
  var route = '/auth/service/' + name;
  var cbRoute = route + '/callback';

  // Calculate the callbackURL for the request
  var OAUTH_SERVER_URL = process.env.OAUTH_SERVER_URL || 'http://flowxo-dev.cc';
  var OAUTH_SERVER_PORT = process.env.OAUTH_SERVER_PORT || 9000;

  var serverUrl = url.parse(OAUTH_SERVER_URL);

  var callbackURL = url.format({
    protocol: serverUrl.protocol,
    hostname: serverUrl.hostname,
    port: OAUTH_SERVER_PORT,
    pathname: cbRoute
  });

  options.callbackURL = callbackURL;

  var strategy = new service.auth.strategy(options, formatCreds);
  passport.use(name, strategy);

  var app = express();
  app.use(session({
    secret: crypto.randomBytes(64).toString('hex'),
    resave: false,
    saveUninitialized: true
  }));

  app.use(passport.initialize());

  app.get(route, passport.authorize(name, service.auth.params));

  app.get(cbRoute, passport.authorize(name), function(req, res) {
    res.status(200).send('Thank you. You may now close this window.');
    cb(req.account);
  });

  app.listen(OAUTH_SERVER_PORT);

  var userUrl = url.format({
    protocol: serverUrl.protocol,
    hostname: serverUrl.hostname,
    port: OAUTH_SERVER_PORT,
    pathname: route
  });

  grunt.log.writeln(['Opening OAuth authentication in browser. Please confirm in browser window to continue.']);

  open(userUrl);
};

/**
 * Handler for OAuth1
 */
AuthUtil.handlers.oauth1 = function(grunt, service, cb) {
  var envs = [{
    option: 'consumerKey',
    key: '<%= slugUpperCased %>_KEY'
  }, {
    option: 'consumerSecret',
    key: '<%= slugUpperCased %>_SECRET'
  }];

  var formatter = function(token, token_secret, profile, done) {
    done(null, {
      token: token,
      token_secret: token_secret,
      consumer_key: service.auth.options.consumerKey,
      consumer_secret: service.auth.options.consumerSecret,
      profile: profile
    });
  };

  AuthUtil.handlers.oauth(grunt, service, envs, formatter, cb);
};

/**
 * Handler for OAuth2
 */
AuthUtil.handlers.oauth2 = function(grunt, service, cb) {
  var envs = [{
    option: 'clientID',
    key: '<%= slugUpperCased %>_ID'
  }, {
    option: 'clientSecret',
    key: '<%= slugUpperCased %>_SECRET'
  }];



  var formatter = function(access_token, refresh_token, profile, done) {
    done(null, {
      access_token: access_token,
      refresh_token: refresh_token,
      profile: profile
    });
  };

  AuthUtil.handlers.oauth(grunt, service, envs, formatter, cb);
};

/**
 * Handler for basic Credentials
 */
AuthUtil.handlers.credentials = function(grunt, service, cb) {
  CommonUtil.promptFields(service.auth.fields, function(err, creds) {
    cb(creds);
  });
};

/**
 * Store Credentials
 */
AuthUtil.storeCredentials = function(credentials) {
  fs.writeFileSync(CREDENTIALS_FILENAME, JSON.stringify(credentials));
};

/**
 * Refresh oauth2 access token
 */
AuthUtil.refreshOAuth2Token = function(service, credentials, cb) {

  var callback = function(access_token, refresh_token, profile, done) {
    done(null, {
      access_token: access_token,
      refresh_token: refresh_token,
      profile: profile
    });
  };

  var strategy = new service.auth.strategy(service.auth.options, callback);
  refresh.use(strategy);

  refresh.requestNewAccessToken(strategy.name, credentials.access_token, function(err, accessToken, refreshToken) {
    if(err) {
      cb('Generating access token failed:' + err);
    }
    if(!!refreshToken) {
      credentials.refresh_token = refreshToken;
    }
    credentials.access_token = accessToken;
    cb(null, credentials);
  });
};


module.exports = AuthUtil;
