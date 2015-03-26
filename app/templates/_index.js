'use strict';

var sdk = require('flowxo-sdk');
var service = new sdk.Service({
	serviceRoot: __dirname,
	name: '<%= name %>',
	slug: '<%= slug %>',<% if(auth.type == 'oauth') { %>
	auth: {
		type: 'oauth',
		authProvider: require('./auth')
	}
	<% } else { %>
	auth: {
		type: 'credentials',
		fields: [
		  <% _.each(auth.fields,function(f){ %>{
		  type: '<%= f.type %>',
		  key: '<%= f.key %>',
		  label: '<%= f.label %>',
		  description: '<%= f.description %>',
		  required: true
		  },<% }); %>
		],
		ping: require('./ping')
	}<% } %>
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