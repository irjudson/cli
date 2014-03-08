function Log(output) {
    this.output = output;
}

Log.prototype.log = function(level, msg) {
    this.output(level + ': ' + msg);
}

Log.prototype.error = function(msg) { this.log('error', msg); }
Log.prototype.help = function(msg)  { this.log('help', msg);  }
Log.prototype.info = function(msg)  { this.log('info', msg);  }

module.exports = Log;