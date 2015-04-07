'use strict';
describe('<%= name %> Service',function(){
  describe('Configuration',function(){
    it('should contain an array of methods',function(){
      expect(this.service.methods).to.be.an('array');
    });
  });
});
