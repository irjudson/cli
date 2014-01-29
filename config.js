var Store = require('nitrogen-leveldb-store');

var config = {
    host: 'api.nitrogen.io', 
    http_port: 443, 
    protocol: 'https',
    local_store_path: 'local'
};

config.store = new Store(config);

config.log_levels = ['info', 'warn', 'error', 'debug'];

module.exports = config;
