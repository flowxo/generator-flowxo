var chai = require('chai');
  should = chai.should(),
     sdk = require('flowxo-sdk')
 service = require('../'),
  replay = require('replay');

replay.fixtures = __dirname + '/fixtures';
replay.mode = process.env.REPLAY || 'bloody';

chai.config.includeStack = true;

global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;

var auth;
try{
	auth = require('../auth');
}catch(e){
	auth = {};
}

global.service = service;
global.runner = new sdk.ScriptRunner(service,{
	auth: auth
});