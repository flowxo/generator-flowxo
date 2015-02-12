describe('<%= name %> Service',function(){
	describe('Configuration',function(){
		it('should contain an array of methods',function(){
			service.methods.should.be.a('array');
		});
	});
});