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
});