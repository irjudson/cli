var cli = require('./lib')
  , optimist = require('optimist');

var options = optimist.argv;
var commands = optimist.argv._;

cli.load(function(err) {
	if (err) return console.log(err);

	cli.execute(commands, options, function(err) {
		if (err) return console.log(err);
	});
});
