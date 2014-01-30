var async = require('async')
  , levelup = require('level')
  , path = require('path');

var DEFAULT_CONFIG = {
    'host': 'api.nitrogen.io',
    'http_port': 443,
    'protocol': 'https'
};

function Store() {
    var homeDirectory = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    var localStorePath = path.join(homeDirectory, '.n2');

    this.db = levelup(localStorePath);
}

Store.prototype.clear = function(callback) {
    var self = this;
    this.getKeys(function(err, keys) {
        keys.forEach(function(key) {
            self.db.del(key);
        });

        return callback(err);
    });
};

Store.prototype.get = function(key, callback) {
    this.db.get(key, function(err, value) {
        if (err) {
            if (err.notFound)
              return callback(null, DEFAULT_CONFIG[key]);
            else
              return callback(err);
        }

        return callback(null, value);
    });
};

Store.prototype.getAll = function(callback) {
    var config = {};
    var self = this;

    this.getKeys(function(err, keys) {
        if (err) return callback(err);

        async.each(keys, function(key, keyCallback) {
            self.get(key, function(err, value) {
                config[key] = value;
                keyCallback(err);
            });
        }, function(err) {
            return callback(err, config);
        });
    });
};

Store.prototype.getKeys = function(callback) {
    var keys = [];
    var keystream = this.db.createKeyStream();

    keystream.on('data', function (key) {
        keys.push(key);
    });

    keystream.on('end', function(err) {
        callback(err, keys);
    });
};

Store.prototype.set = function(key, value, callback) {
    this.db.put(key, value, callback);
};

Store.prototype.delete = function(key, callback) {
    this.db.del(key, callback);
};

module.exports = new Store();