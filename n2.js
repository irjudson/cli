var cli = require('./lib')
  , optimist = require('optimist');

var options = optimist.argv;
var commands = optimist.argv._;

cli.execute(commands, options);