module.exports = {
  /*
   * The strategy key should return the Passport Strategy for your service.
   * Passport has numerous available strategies for popular services, normally named
   * e.g. passport-facebook, passport-twitter etc
   * Example:
   * strategy: require('passport-facebook').Strategy
   */
  strategy: null/** UPDATE THIS **/,
  type: 'oauth2',
  /*
   * The application ID and secret should be in the environment
   */
   options:{
    clientId: process.env.<%= slug.toUpperCase() %>_ID,
    clientSecret: process.env.<%= slug.toUpperCase() %>_SECRET,
  },
  /*
   * Any params here will be passed to the authentication request. Available parameters
   * will be documented by the service API. Common parameters are scope e.g.
   * params:{
       scope: ['access_read','access_write']
     }
   */
  params:{
  }
};

