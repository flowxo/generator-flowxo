var symbols = require('log-symbols');

var indent = '   ';
var credentialsWhatNextMsg = [
  'What to do next',
  '---------------',
  indent + symbols.success + ' Implement your service logic inside index.js',
  indent + symbols.success + ' Update your ping.js script',
  indent + symbols.success + ' Scaffold methods with `yo flowxo:method`',
  indent + symbols.success + ' Create a test authentication with `grunt auth`',
  indent + symbols.success + ' Run tests with `grunt test`',
  indent + symbols.success + ' Run individual methods from the command line with `grunt run`',
  indent + symbols.success + ' Develop with `grunt`',
].join('\n');

var oauthWhatNextMsg = [
  'What to do next',
  '---------------',
  indent + symbols.success + ' Implement your service logic inside index.js',
  indent + symbols.success + ' Update your auth.js script',
  indent + symbols.success + ' Scaffold methods with `yo flowxo:method`',
  indent + symbols.success + ' Create a test authentication with `grunt auth`',
  indent + symbols.success + ' Run tests with `grunt test`',
  indent + symbols.success + ' Run individual methods from the command line with `grunt run`',
  indent + symbols.success + ' Develop with `grunt`',
].join('\n');

module.exports = {
  welcome: 'Welcome to the FlowXO Service generator.',
  whatNext:{
    oauth: oauthWhatNextMsg,
    credentials: credentialsWhatNextMsg
  }
};
