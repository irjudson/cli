var async = require('async')
  , MemoryStore = require('nitrogen-memory-store')
  , nitrogen = require('nitrogen')
  , store = require('./store')
  , utils = require('./utils');

var DEFAULT_CONFIG = {
    host: 'api.nitrogen.io',
    http_port: 443,
    protocol: 'https'
};

var setConfig = function(commands, callback) {
    var key = utils.popCommand(commands);
    var value = utils.popCommand(commands);

    key = key.toLowerCase();
    switch(key) {
        case 'host':
        case 'http_port':
        case 'protocol': {
            store.set(key, value, callback);
            break;
        }

        default: {
            return callback('unknown service config: ' + key);
            break;
        }
    }
};

var getConfig = function(callback) {
    return store.getAll(function(err, config) {
        Object.keys(DEFAULT_CONFIG).forEach(function(key) {
            if (!config[key]) {
                config[key] = DEFAULT_CONFIG[key];
            }
        });

        return callback(err, config);
    });
};

var getService = function(callback) {
    getConfig(function(err, config) {
        if (err) return callback(err);

        config.store = new MemoryStore();

        var service = new nitrogen.Service(config);
        return callback(null, service);
    });
};

var listConfig = function(callback) {
    getConfig(function(err, config) {
        if (err) return callback(err);

        delete config.password;

        for (var configKey in config) {
            console.log(configKey + ': ' + config[configKey]);
        }

        return callback();
    })
};

var execute = function(commands, options, callback) {
    var command = utils.popCommand(commands) || 'ls';

    switch(command) {
        case 'config': {
            setConfig(commands, function() {
                listConfig(callback);
            });
            break;
        }

        case 'ls': {
            listConfig(callback);
            break;
        }

        default: {
            console.log('unknown service command: ' + command);
            break;
        }
    }
};

module.exports = {
    execute: execute,

    getConfig: getConfig,
    getService: getService
};