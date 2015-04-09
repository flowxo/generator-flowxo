var _ = require('lodash');

module.exports = {
  service: [
    // Service Name
    {
      type: 'input',
      name: 'name',
      message: 'What is the full name of your service (e.g. EchoSign or PipeDrive)?',
      default: this.service,
      validate: function(input) {
        return !!input;
      }
    },

    // Auth Type
    {
      type: 'list',
      name: 'auth_type',
      message: 'What sort of authentication does the service use?',
      choices: [
        {name: 'Credentials (e.g. API Key or username/password)', value: 'credentials'},
        {name: 'OAuth 1', value: 'oauth1'},
        {name: 'OAuth 2', value: 'oauth2'},
        // {name: 'OpenID', value: 'openid'},
      ],
      default: 0,
      validate: function(input) {
        return !!input;
      }
    }
  ],

  oauth: [],
  credentials: [
    // Field Label
    {
      type: 'input',
      name: 'label',
      message: 'Credentials Field Label e.g. "API Key" or "Access Token"',
      validate: function(input) {
        return !!input;
      }
    },
    // Field Type
    {
      type: 'list',
      name: 'type',
      choices: [{name: 'Text',value: 'text'},{name: 'Select',value:'select'}],
      message: 'Credentials Field Type',
      validate: function(type) {
        return !!type;
      }
    },
    // Field Key
    {
      type: 'input',
      name: 'key',
      default: function(answers){
        return _.snakeCase(answers.label);
      },
      message: 'Credentials Field Key e.g. api_key or auth_token, used by your scripts',
      validate: function(key) {
        return !!key;
      }
    },
    // Field Description
    {
      type: 'input',
      name: 'description',
      message: 'Credentials Field Description - the message describing the field to the end-user'
    }
  ]
};
