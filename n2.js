var cli = require('./lib')
  , optimist = require('optimist');

var commandArguments = optimist.argv._;

cli.execute(commandArguments, session, function(err) {
	if (err) return console.log('command failed: ' + err);
});
