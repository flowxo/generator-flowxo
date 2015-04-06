'use strict';
describe('<%= name %> Service',function(){
	describe('Configuration',function(){
		it('should contain an array of methods',function(){
			/* global service */
			this.service.methods.should.be.a('array');
		});
	});
});
