'use strict';
var  sdk = require('flowxo-sdk'),
 service = require('../');

var credentials = {};
try{
  credentials = require('../credentials');
}catch(e){
}

beforeEach(function(){
  this.service = service;
  this.credentials = credentials;
  this.runner = new sdk.ScriptRunner(service,{
    credentials: credentials
  });
});
