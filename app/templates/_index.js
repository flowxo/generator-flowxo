'use strict';

var sdk = require('flowxo-sdk');
var service = new sdk.Service({
  serviceRoot: __dirname,
  name: '<%= name %>',
  slug: '<%= slug %>',<% if(auth.type == 'credentials') { %>
  auth: {
    type: 'credentials',
    authProvider: require('./auth'),
    fields: [
      <% _.each(auth.fields,function(f){ %>{
      type: '<%= f.type %>',
      key: '<%= f.key %>',
      label: '<%= f.label %>',
      description: '<%= f.description %>',
      required: true
      },<% }); %>
    ]
  },
  scripts:{
    ping: require('./ping')
  }<% } else { %>
  auth: {
    type: '<%= auth.type %>',
    /*
     * The strategy key should return the Passport Strategy for your service.
     * Passport has numerous available strategies for popular services, normally named
     * e.g. passport-facebook, passport-twitter etc
     * Example:
     * strategy: require('passport-facebook').Strategy
     */
    strategy: null,

    // These options will be passed to the strategy when registering
    // For example, for OAuth2 the options could be
    // options:{
    //   clientID: process.env.MY_SERVICE_ID,
    //   clientSecret: process.env.MY_SERVICE_SECRET
    // }
    options: {

    },

    // Authentication parameters to be used.
    // For example where an OAuth2 API defines access scopes,
    // you may send
    // params:{
    //   scope: ['allow_email']
    // }
    params: {

    }

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
