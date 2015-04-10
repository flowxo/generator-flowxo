'use strict';

describe('<%= name %>', function() {
  describe('Run Script', function() {
    it('should have a working run script', function(done) {
      var options = {};
      this.runner.run('<%= slug %>', 'run', options, function(err, output) {
        expect(err).not.to.exist;<% if(type === 'poller') { %>
        expect(output).to.be.an('array'); <% } else { %>
        expect(output).to.be.an('object'); <% } %>
        done();
      });
    });
  });<% if(scripts.indexOf('input') !== -1) { %>

  describe('Custom Input Script', function() {
    it('should have a working custom input script', function(done) {
      var options = {};
      this.runner.run('<%= slug %>', 'input', options, function(err, output) {
        expect(err).not.to.exist;
        expect(output).to.be.an('array');
        done();
      });
    });
  });<% } if(scripts.indexOf('output') !== -1) { %>

  describe('Custom Output Script', function() {
    it('should have a working custom output script', function(done) {
      var options = {};
      this.runner.run('<%= slug %>', 'output', options, function(err, output) {
        expect(err).not.to.exist;
        expect(output).to.be.an('array');
        done();
      });
    });
  });<% } %>
});
