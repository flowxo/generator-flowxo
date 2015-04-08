'use strict';

var sdk = require('flowxo-sdk');

var service = new sdk.Service({
  serviceRoot: __dirname,
  name: '<%= name %>',
  slug: '<%= slug %>',<% if(auth.type === 'credentials') { %>
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
    // For example, for OAuth 2.0 the options could be
    //
    //   options:{
    //     clientID: process.env.MY_SERVICE_ID,
    //     clientSecret: process.env.MY_SERVICE_SECRET
    //   }
    //
    // ...and for OAuth 1.0 ...
    //
    //   options:{
    //     consumerKey: process.env.TRELLO_KEY,
    //     consumerSecret: process.env.TRELLO_SECRET,
    //     trelloParams: {
    //       scope: 'read,write',
    //       name: 'Flow XO',
    //       expiration: 'never'
    //     }
    //   }
    options: {
      <% if(auth.type === 'oauth1') { %>
        consumerKey: process.env.<%= slug.toUpperCase()%>_KEY,
        consumerSecret: process.env.<%= slug.toUpperCase()%>_SECRET
      <% } else if (auth.type === 'oauth2') { %>
        clientID: process.env.<%= slug.toUpperCase()%>_ID,
        clientSecret: process.env.<%= slug.toUpperCase()%>_SECRET
      <% } %>
    },

    // Authentication parameters to be used.
    // For example where an OAuth 2.0 API defines access scopes,
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
