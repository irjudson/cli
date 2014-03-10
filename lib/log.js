function Log(output) {
    this.output = output;
}

Log.prototype.log = function(level, msg) {
    if (level)
        msg = level + ": " + msg;

    this.output(msg);
}

Log.prototype.error = function(msg) { this.log('error', msg); }
Log.prototype.help = function(msg)  { this.log(null, msg);  }
Log.prototype.info = function(msg)  { this.log('info', msg);  }

module.exports = Log;