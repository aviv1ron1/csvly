var Readly = require('readly');
var util = require("util");
var EventEmitter = require("events").EventEmitter;

var parseCsv = function(line) {
    var obj = {};
    var i = 0;
    line.split(',').forEach(function(v) {
        obj[i++] = v;
    });
    return obj;
}

function Csvly(filename, opts) {
    EventEmitter.call(this);
    this.filename = filename;
    if (opts) {
        this.encoding = opts.encoding;
        this.eol = opts.eol;
        this.headers = opts.headers;
        this.firstLineIsHeaders = opts.firstLineIsHeaders;
    }
    if (this.headers && this.firstLineIsHeaders) {
        throw new Error("opts must include either headers or firstLineIsHeaders option. cannot contain both");
    }
    if (this.firstLineIsHeaders) {
        var self = this;
        reader = new Readly(this.filename, this.encoding, this.eol);
        reader.on('line', function(line) {
            self.headers = parseCsv(line);
        });
        reader.read(0, 1);
    }
    if (this.headers) {
        var hdr = {};
        var i = 0;
        this.headers.forEach(function(h) {
            hdr[i++] = h;
        });
        this.headers = hdr;
    }
}

util.inherits(Csvly, EventEmitter);

Csvly.prototype.read = function(start, count) {
    var self = this;
    this.reader = new Readly(this.filename, this.encoding, this.eol);
    self.reader.on('line', function(line) {
        var obj = {};
        var i = 0;
        line.split(',').forEach(function(v) {
            if (self.headers) {
                obj[self.headers[i++]] = v;
            } else {
                obj[i++] = v;
            }
        });
        self.emit("line", obj);
    });
    self.reader.on('end', function() {
        self.emit('end');
    });
    if (self.firstLineIsHeaders && start == 0) {
        start = 1;
    }
    self.reader.read(start, count);
}

Csvly.prototype.readAll = function() {
    this.read();
}

Csvly.prototype.readFirst = function(count) {
    this.read(0, count);
}

module.exports = Csvly;
