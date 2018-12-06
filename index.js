var csv = require('csv');
var util = require("util");
var EventEmitter = require("events").EventEmitter;
var fs = require('fs');

function Csvly(filename, opts) {
    EventEmitter.call(this);
    if (opts) {
        this.encoding = opts.encoding;
        this.eol = opts.eol;
        this.headers = opts.headers;
        this.firstLineIsHeaders = opts.firstLineIsHeaders;
        this.array = opts.array;
		this.customOpts = opts.custom;
    }
    if (typeof filename === "string") {
        try {
            stats = fs.lstatSync(filename);
            if (!stats.isFile()) {
                throw new Error("filename is a directory name, not a file. " + filename);
            }
        } catch (e) {
            throw new Error("file does not exist " + filename);
        }
        this.filename = filename;
    } else {
        this.stream = filename;
        this.stream.setEncoding(this.encoding);
    }
    if (this.headers && this.firstLineIsHeaders) {
        throw new Error("opts must include either headers or firstLineIsHeaders option. cannot contain both");
    }
    this.parserOpts = {};
    if (this.firstLineIsHeaders) {
        this.parserOpts.columns = true;
    }
    if (this.eol) {
        this.parserOpts.rowDelimiter = this.eol;
    }
    if (this.headers) {
        this.parserOpts.columns = opts.headers;
    }
	if(this.customOpts) {
		for(var opt in this.customOpts) {
			this.parserOpts[opt] = this.customOpts[opt];
		}
	}
}

util.inherits(Csvly, EventEmitter);

Csvly.prototype.read = function(start, count) {
    var self = this;
    var shouldContinue = true;
    if (!start) {
        start = 0;
    }

    function handleData(d) {
        //console.log("handledata", start, count);
        if (start > 0) {
            start--;
        } else {
            if (typeof count !== 'undefined') {
                if (count > 0) {
                    count--;
                    self.emit("line", d);
                } else {
                    count = 1;
                    shouldContinue = false;
                    self.parser.end();
                    self.emit("end");
                    //self.stream.close();
                }
            } else {
                self.emit("line", d);
            }
        }
    }

    if (!this.headers && !this.firstLineIsHeaders && !this.array) {
        this.parserOpts.columns = function(line) {
            var hdrs = [];
            var obj = {};
            for (var i = 0; i < line.length; i++) {
                hdrs.push(i);
                obj[i] = line[i];
            };
            handleData(obj);
            return hdrs;
        }
    }

    this.parser = csv.parse(this.parserOpts);

    this.parser.on('readable', function() {
        //console.log("readable")
        data = self.parser.read();
        //console.log("data", data)
        while (shouldContinue && data) {
            handleData(data)
            if (shouldContinue) {
                data = self.parser.read();
            }
        }
    });
    self.parser.on('finish', function() {
        if (shouldContinue) {
            self.emit('end');
        }
    });
    self.parser.on('error', (err) => {
        self.emit('error', err);
    });
    if (util.isNullOrUndefined(this.stream)) {
        this.stream = fs.createReadStream(this.filename, {
            encoding: this.encoding
        });
    }
    this.stream.pipe(this.parser);
}

Csvly.prototype.readAll = function() {
    this.read();
}

Csvly.prototype.readFirst = function(count) {
    this.read(0, count);
}

module.exports = Csvly;
