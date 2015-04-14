'use strict';
var open = require('open');
var express = require('express');
var session = require('express-session');
var crypto = require('crypto');
var url = require('url');
var passport = require('passport');
var fs = require('fs');
var Util = require('./run_util');
var refresh = require('passport-oauth2-refresh');

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

/*
 * Format credentials for OAuth1
 */


/**
 * Generic handler for OAuth
 */
AuthUtil.handlers.oauth = function(service, formatCreds, cb) {


  var OAUTH_SERVER_URL = process.env.OAUTH_SERVER_URL || 'http://flowxo-dev.cc';
  var OAUTH_SERVER_PORT = process.env.OAUTH_SERVER_PORT || 9000;

  var app = express();
  app.use(session({
    secret: crypto.randomBytes(64).toString('hex'),
    resave: false,
    saveUninitialized: true
  }));

  var name = service.slug;
  var route = '/auth/service/' + name;
  var cbRoute = route + '/callback';

  // Calculate the callbackURL for the request
  var serverUrl = url.parse(OAUTH_SERVER_URL);

  var callbackURL = url.format({
    protocol: serverUrl.protocol,
    hostname: serverUrl.hostname,
    port: OAUTH_SERVER_PORT,
    pathname: cbRoute
  });

  var options = cloneObject(service.auth.options);
  options.callbackURL = callbackURL;

  if(!service.auth.strategy) {
    throw 'Unable to load strategy - please check you have a valid' +
    ' strategy defined in your `index.js` file.';
  }
  var strategy = new service.auth.strategy(options, formatCreds);

  passport.use(name, strategy);
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

  // grunt.log.writeln(['Opening OAuth authentication in browser. Please confirm in browser window to continue.']);

  open(userUrl);
};

/**
 * Handler for OAuth1
 */
AuthUtil.handlers.oauth1 = function(service, cb) {
  var formatter = function(token, token_secret, profile, done) {
    done(null, {
      token: token,
      token_secret: token_secret,
      consumer_key: service.auth.options.consumerKey,
      consumer_secret: service.auth.options.consumerSecret,
      profile: profile
    });
  };

  AuthUtil.handlers.oauth(service, formatter, cb);
};

/**
 * Handler for OAuth2
 */
AuthUtil.handlers.oauth2 = function(service, cb) {
  var formatter = function(access_token, refresh_token, profile, done) {
    done(null, {
      access_token: access_token,
      refresh_token: refresh_token,
      profile: profile
    });
  };

  AuthUtil.handlers.oauth(service, formatter, cb);
};

/**
 * Handler for basic Credentials
 */
AuthUtil.handlers.credentials = function(service, cb) {
  Util.promptFields(service.auth.fields, function(err, creds) {
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

  var strategy = new service.auth.strategy(service.auth.options,callback);
  refresh.use(strategy);

  refresh.requestNewAccessToken(strategy.name,credentials.access_token,function(err,accessToken,refreshToken){
    if(err){
      cb('Generating access token failed:' + err);
    }
    if(!!refreshToken){
      credentials.refresh_token = refreshToken;
    }
    credentials.access_token = accessToken;
    cb(null,credentials);
  });
};


module.exports = AuthUtil;
