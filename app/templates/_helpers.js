var chai = require('chai');
var sinonChai = require('sinon-chai');
var sdk = require('flowxo-sdk');

chai.use(sinonChai);
chai.use(sdk.Chai);

chai.should();
chai.config.includeStack = true;

global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;
global.sinon = require('sinon');
