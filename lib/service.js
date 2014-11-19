var async = require('async')
  , MemoryStore = require('nitrogen-memory-store')
  , nitrogen = require('nitrogen')
  , cli = require('../lib');

var getConfig = function(callback) {

    var config = {
        host: 'api.nitrogen.io',
        protocol: 'https',
        http_port: 443,
        log_levels: ['warn', 'error']
    };

    getCurrentService(function(err, currentService) {
        if (err) return callback(err);

        cli.store.get(currentService, function(err, configJson) {
            if (err) return callback(err);

            if (configJson) {
                Object.keys(configJson).forEach(function(key) {
                    config[key] = configJson[key];
                });
            }

            return callback(null, config, currentService);
        });
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

var getService = function(callback) {
    getConfig(function(err, config) {
        if (err) return callback(err);

        config.store = new MemoryStore();

        var service = new nitrogen.Service(config);
        return callback(null, service);
    });
};

var help = function(callback) {

    cli.utils.displayCommands('Service Commands', [
        ['show', 'Display current selected configuration.'],
        ['set <parameter> <value>', 'Set service parameter with value. (eg. \'set host localhost\')'],
        ['use <service_nickname>', 'Switch to a different service. (eg. \'use api.nitrogen.io\')']
    ]);

    return callback();
};

var show = function(callback) {
    getConfig(function(err, config, currentService) {
        if (err) return callback(err);

        cli.log.info('currently using service: ' + currentService);

        for (var configKey in config) {
            cli.log.info(configKey + ': ' + config[configKey]);
        }

        return callback();
    })
};

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

                    return show(callback);
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

var setConfig = function(config, callback) {
    getCurrentService(function(err, currentService) {
        if (err) return callback(err);

        cli.store.set(currentService, config, callback);
    });
};

var use = function(callback) {
    var nickname = cli.nextArgument();
    var self = this;

    if (!nickname) return callback('Need service nickname to use.');

    cli.store.set('currentService', nickname, function(err) {
        if (err) return callback(err);

        show(callback);
    });
};

var execute = function(callback) {
    var argument = cli.nextArgument() || 'show';

    switch(argument) {
        case 'help': {
            help(callback);
            break;
        }

        case 'set': {
            set(callback);
            break;
        }

        case 'show': {
            show(callback);
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
