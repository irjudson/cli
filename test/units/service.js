var assert = require('assert'),
    service = require('../../lib/service'),
    store = require('../../lib/store');

describe('service', function() {

    it('should be able to configure a value and get an updated config.', function(done) {
        service.execute(['config', 'protocol','http'], {}, function(err) {
	        assert.ifError(err);

            store.get('protocol', function(err, value) {
                assert.ifError(err);
                assert.equal(value, 'http');

                service.getConfig(function(err, config) {
                    assert.ifError(err);

                    assert.equal(config['protocol'], 'http');
                    done();
                });
            });
    	});
    });

});