var cli = require('./lib')
  , optimist = require('optimist');

var commandArguments = optimist.argv._;

cli.arguments = optimist.argv._;

cli.execute(function(err) {
    if (err) return console.log('command failed: ' + err);

    process.exit(0);
});
