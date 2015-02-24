'use strict';

var config = {
	name: '<%= name %>',
	slug: '<%= slug %>',
	type: '<%= type %>',
	kind: '<%= kind %>',
	scripts:{
		run: require('./run'),
		input: require('./input'),
		output: require('./output')
	},
	fields:{
		input: [],
		output: []
	}
};

module.exports = function(service){
	service.registerMethod(config);
};