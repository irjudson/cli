var Store = require('nitrogen-leveldb-store');

var config = {
//    host: 'localhost',
//    http_port: 3030,
//    protocol: 'http'
};

config.store = new Store(config);
config.log_levels = ['info', 'warn', 'error', 'debug'];

module.exports = config;