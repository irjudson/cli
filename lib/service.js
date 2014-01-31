var async = require('async')
  , MemoryStore = require('nitrogen-memory-store')
  , nitrogen = require('nitrogen')
  , cli = require('../lib');

var setParameter = function(callback) {
    var key = cli.nextArgument().toLowerCase();
    var value = cli.nextArgument();

    switch(key) {
        case 'host':
        case 'http_port':
        case 'protocol': {
            cli.store.set(key, value, callback);
            break;
        }

        default: {
            return callback('Unknown service parameter: ' + key);            
            break;
        }
    }
};

var getConfig = function(callback) {
    var config = {
        host: 'api.nitrogen.io',
        protocol: 'https',
        http_port: 443
    };

    cli.store.getAll(function(err, storedConfig) {
        if (err) return callback(err);

        Object.keys(storedConfig).forEach(function(key) {
            config[key] = storedConfig[key];
        });

        return callback(null, config);
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

        for (var configKey in config) {
            console.log(configKey + ': ' + config[configKey]);
        }

        return callback();
    })
};

var execute = function(callback) {
    var argument = cli.nextArgument() || 'ls';

    switch(argument) {
        case 'set': {
            setParameter(function(err) {
                if (err) return callback(err);

                listConfig(callback);
            });
            break;
        }

        case 'ls': {
            listConfig(callback);
            break;
        }

        default: {
            console.log('unknown service command: ' + argument);
            break;
        }
    }
};

module.exports = {
    execute: execute,

    getConfig: getConfig,
    getService: getService
};