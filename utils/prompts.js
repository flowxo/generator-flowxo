var _ = require('lodash');

module.exports = {
	service: [
	  // Service Name
	  {
	    type: 'input',
	    name: 'name',
	    message: 'What is the full name of your service (e.g. EchoSign or PipeDrive)?',
	    default: this.service,
	  },

	  // Auth Type
	  {
	    type: 'list',
	    name: 'auth_type',
	    message: 'What sort of authentication does the service use?',
	    choices: [
	      'Credentials (e.g. API Key or username/password)',
	      'OAuth'
	    ],
	    default: 0,
	    filter: function(val){
	      if(val.indexOf('Credentials') === 0){
	        return 'credentials'
	      }else{
	        return 'oauth';
	      }
	    }
	  }
	],

	oauth: [],
	credentials: [
    // Field Label
    {
      type: 'input',
      name: 'label',
      message: 'Field Label'
    },
		// Field Type
    {
      type: 'list',
      name: 'type',
      choices: [{name: 'Text',value: 'text'},{name: 'Select',value:'select'}],
      message: 'Field Type'
    },
    // Field Key
    {
      type: 'input',
      name: 'key',
      default: function(answers){
        return _.snakeCase(answers.label)
      },
      message: 'Field Key'
    },
    // Field Description
    {
      type: 'input',
      name: 'description',
      message: 'Field Description'
    }
	]
};