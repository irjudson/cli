var assert = require('assert'),
    store = require('../../lib/store');

describe('store', function() {

    it('should be able to set and get a value.', function(done) {
        store.set('foo','bar', function(err) {
            assert.ifError(err);

            store.get('foo', function(err, value) {
                assert.ifError(err);

                assert.equal(value, 'bar');
                done();
            });
        });
    });

    it('should be able to set and getAll', function(done) {
        store.set('foo','bar', function(err) {
            assert.ifError(err);

            store.getAll(function(err, hash) {
                assert.ifError(err);

                assert.equal(hash['foo'], 'bar');
                done();
            });
        });
    });


    it('should be able to remove a value', function(done) {
        store.delete('foo', function(err) {
            assert.ifError(err);

            store.get('foo', function(err, hash) {
                assert.notEqual(err, "could not load data");
                done();
            });
        });
    });

});