var assert = require('assert'),
    cli = require('../../lib');

describe('service', function() {

    // it('should be able to show the current configuration.', function(done) {
    //     cli.currentArgument = 0;
    //     cli.arguments = [ 'show' ];
    //     cli.service.execute(function(err) {
    //         assert.ifError(err);
    //         done();
    //     });
    // });

    it('should be able to configure a value and get an updated config.', function(done) {
        cli.currentArgument = 0;
        cli.arguments = [ 'set', 'protocol', 'http' ];
        cli.service.execute(function(err) {
	        assert.ifError(err);
            cli.service.getConfig(function(err, config, service) {
                assert.ifError(err);
                assert.equal(config['protocol'], 'http');
                done();
            });
    	});
    });
});