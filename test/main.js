var cli = require('../lib')
  , store = require('../lib/store');

beforeEach(function(done) {
    cli.resetCurrentArgument();
    done();
});
