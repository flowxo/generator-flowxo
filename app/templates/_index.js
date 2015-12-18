'use strict';

var sdk = require('flowxo-sdk');

var service = new sdk.Service({
  serviceRoot: __dirname,
  name: '<%= name %>',
  slug: '<%= slug %>',
  help: '<%= help %>',<% if(auth.type === 'credentials') { %>
  auth: {
    type: 'credentials',
    fields: [<% auth.fields.forEach(function(f, i) { %>{
      type: '<%= f.type %>',
      key: '<%= f.key %>',
      label: '<%= f.label %>',
      description: '<%= f.description %>',
      required: true
    }<% if(i < (auth.fields.length-1)) { %>,<% } %><% }); %>]
  },
  scripts: {
    ping: require('./ping')
  }<% } else if(auth.type === 'oauth1') { %>
  auth: {
    type: 'oauth1',

    // The strategy key should return the Passport Strategy for your service.
    // Passport has numerous available strategies for popular services, normally named
    // e.g. passport-twitter etc
    // Example:
    // strategy: require('passport-twitter').Strategy
    strategy: null,

    // These options will be passed to the strategy when registering.
    // An OAuth 1.0 or 1.0a strategy requires `consumerKey` and `consumerSecret`
    // to be passed. Fill in your key and secret for this service in the
    // .env file and they will be populated at runtime below.
    // If your strategy requires any other options to be passed when registering,
    // add them below.
    options: {
      consumerKey: process.env.<%= envSlug %>_ID,
      consumerSecret: process.env.<%= envSlug %>_SECRET
    }
  }<% } else if (auth.type === 'oauth2') { %>
  auth: {
    type: 'oauth2',

    // The strategy key should return the Passport Strategy for your service.
    // Passport has numerous available strategies for popular services, normally named
    // e.g. passport-twitter etc
    // Example:
    // strategy: require('passport-twitter').Strategy
    strategy: null,

    // An OAuth 2.0 strategy requires `clientID` and `clientSecret`
    // to be passed. Fill in your ID and secret for this service in the
    // .env file and they will be populated at runtime below.
    // If your strategy requires any other options to be passed when registering,
    // add them below.
    options: {
      clientID: process.env.<%= envSlug %>_ID,
      clientSecret: process.env.<%= envSlug %>_SECRET,
      state: true
    },

    // Authentication parameters to be used.
    // These are sent when making an OAuth request.
    // For example, where an OAuth 2.0 API defines access scopes,
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
