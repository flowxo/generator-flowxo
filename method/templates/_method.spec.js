'use strict';
describe('<%= name %>',function(){
	describe('Run Script',function(){
		it('should have a working run script',function(done){
			runner.run('<%= slug %>','run',{},function(err,output){
				should.exist(output);
				done();
			});
		});
	});
<% if (scripts.indexOf('input')!==-1) { %>
	describe('Custom Input Script',function(){
		it('should have a working custom input script',function(done){
			runner.run('<%= slug %>','input',{},function(err,output){
				should.exist(output);
				done();
			});
		});
	});	
<% } %>
<% if (scripts.indexOf('output')!==-1) { %>
	describe('Custom Output Script',function(){
		it('should have a working custom output script',function(done){
			runner.run('<%= slug %>','output',{},function(err,output){
				should.exist(output);
				done();
			});
		});
	});	
<% } %>
});