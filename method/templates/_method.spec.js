'use strict';
describe('<%= name %>',function(){
  describe('Run Script',function(){
    it('should have a working run script',function(done){
      this.runner.run('<%= slug %>','run',{},function(err,output){
        expect(err).to.be.null;
        expect(output).to.be.a('object');
        done();
      });
    });
  });
<% if (scripts.indexOf('input')!==-1) { %>
  describe('Custom Input Script',function(){
    it('should have a working custom input script',function(done){
      this.runner.run('<%= slug %>','input',{},function(err,output){
        expect(err).to.be.null;
        expect(output).to.be.a('array');
        done();
      });
    });
  });
<% } %>
<% if (scripts.indexOf('output')!==-1) { %>
  describe('Custom Output Script',function(){
    it('should have a working custom output script',function(done){
      this.runner.run('<%= slug %>','output',{},function(err,output){
        expect(err).to.be.null;
        expect(output).to.be.a('array');
        done();
      });
    });
  });
<% } %>
});
