'use strict';

var sdk = require('flowxo-sdk');
var service = new sdk.Service({
	serviceRoot: __dirname,
	name: '<%= name %>',
	slug: '<%= slug %>',
	auth: <%= JSON.stringify(auth,null,2) %>
});

/*
 Attach any service level methods to your service here, for example
 
   service.request = function(options){
	//...
   }
 then in your methods you'll be able to do

   this.request({id: 123});
*/
module.exports = service;