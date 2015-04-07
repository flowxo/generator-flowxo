'use strict';
describe('<%= name %> Service',function(){
  describe('Configuration',function(){
    it('should contain an array of methods',function(){
      this.service.methods.should.be.an('array');
    });
  });
});
