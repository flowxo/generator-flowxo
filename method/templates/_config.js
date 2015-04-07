'use strict';

var config = {
	name: '<%= name %>',
	slug: '<%= slug %>',
	type: '<%= type %>',
	kind: '<%= kind %>',
	scripts:{ <% if(scripts.indexOf('input')!==-1){ %>
		input: require('./input'), <% } %><% if(scripts.indexOf('output')!==-1){%>
		output: require('./output'), <% } %>
		run: require('./run')
	},
	fields:{
		input: [],
		output: []
	}
};

module.exports = function(service){
	service.registerMethod(config);
};
