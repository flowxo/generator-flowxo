var chai = require('chai'),
     sdk = require('flowxo-sdk'),
 service = require('../'),
  replay = require('replay');

replay.fixtures = __dirname + '/fixtures';
replay.mode = process.env.REPLAY || 'bloody';

chai.should();
chai.config.includeStack = true;

global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;

var credentials;
try{
	credentials = require('../credentials');
}catch(e){
	credentials = {};
}

/* global service */
global.service = service;
global.runner = new sdk.ScriptRunner(service,{
	credentials: credentials
});
