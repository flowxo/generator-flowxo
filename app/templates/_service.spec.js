'use strict';
describe('<%= name %> Service', function() {
  describe('Configuration', function() {
    it('should be a valid service', function() {
      expect(this.service).to.be.a.flowxo.service;
    });<% if(auth.type === 'oauth1') { %>

    it('should define a strategy', function() {
      expect(this.service.auth.strategy).to.exist;
    });

    it('should define strategy options', function() {
      expect(this.service.auth.options).to.have.all.keys('consumerKey', 'consumerSecret');
    });<% } if(auth.type === 'oauth2') { %>

    it('should define a strategy', function() {
      expect(this.service.auth.strategy).to.exist;
    });

    it('should define strategy options', function() {
      expect(this.service.auth.options).to.have.all.keys('clientID', 'clientSecret', 'state');
    });<% } %>
  });<% if(auth.type === 'credentials') { %>

  describe('Authentication', function() {
    it('should have a working ping script', function(done) {
      var options = {};
      this.runner.run('ping', options, function(err) {
        expect(err).not.to.exist;
        done();
      });
    });
  });<% } %>
});
