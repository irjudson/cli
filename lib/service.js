var async = require('async')
  , MemoryStore = require('nitrogen-memory-store')
  , nitrogen = require('nitrogen')
  , cli = require('../lib');

var set = function(callback) {
    var key = cli.nextArgument().toLowerCase();
    var self = this;
    var value = cli.nextArgument();

    getConfig(function(err, currentConfig) {
        if (err) return callback(err);

        switch(key) {
            case 'host':
            case 'http_port':
            case 'protocol': {
                currentConfig[key] = value;
                setConfig(currentConfig, function(err) {
                    if (err) return callback(err);

                    return list(callback);
                });
                break;
            }

            default: {
                return callback('Unknown service parameter: ' + key);            
                break;
            }
        }
    });
};

var getCurrentService = function(callback) {
    cli.store.get('currentService', function(err, currentService) {
        if (err) return callback(err);

        if (!currentService)
            currentService = 'api.nitrogen.io';

        return callback(null, currentService);
    });
};

var getConfig = function(callback) {
    // default config
    var config = {
        host: 'api.nitrogen.io',
        protocol: 'https',
        http_port: 443
    };

    getCurrentService(function(err, currentService) {
        if (err) return callback(err);

        cli.store.get(currentService, function(err, configJson) {
            if (err) return callback(err);

            if (configJson) {
                var storedConfig = JSON.parse(configJson);
                Object.keys(storedConfig).forEach(function(key) {
                    config[key] = storedConfig[key];
                });                
            }

            return callback(null, config);
        });
    });
};

var setConfig = function(config, callback) {
    getCurrentService(function(err, currentService) {
        if (err) return callback(err);

        cli.store.set(currentService, JSON.stringify(config), callback);
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

var list = function(callback) {
    getConfig(function(err, config) {
        if (err) return callback(err);

        for (var configKey in config) {
            cli.log.info(configKey + ': ' + config[configKey]);
        }

        return callback();
    })
};

var use = function(callback) {
    var nickname = cli.nextArgument();
    var self = this;

    if (!nickname) return callback('Need service nickname to use.');

    cli.store.set('currentService', nickname, function(err) {
        if (err) return callback(err);

        list(callback);
    });
};

var execute = function(callback) {
    var argument = cli.nextArgument() || 'ls';

    switch(argument) {
        case 'ls': {
            list(callback);
            break;
        }

        case 'set': {
            set(callback);
            break;
        }

        case 'use': {
            use(callback);
            break;
        }

        default: {
            cli.log.error('unknown service command: ' + argument);
            break;
        }
    }
};

module.exports = {
    execute: execute,

    getConfig: getConfig,
    getService: getService
};