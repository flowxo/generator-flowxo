'use strict';
describe('<%= name %> Service',function(){
  describe('Configuration',function(){
    it('should contain an array of methods',function(){
      expect(this.service).to.be.a.flowxo.service;
    });
  });
});
