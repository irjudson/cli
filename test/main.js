var store = require('../lib/store');

before(function(done) {
    store.clear(done);
});

after(function(done) {
    store.clear(done);
});
