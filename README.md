# csvly

[![npm package](https://nodei.co/npm/csvly.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/csvly/)

read csv files line by line
uses [readly](https://www.npmjs.com/package/readly) to read line by line from the given file and fires an event for each parsed line
## usage:
read receives

`start` - optional number, from which row to start reading (how many lines to skip from the begining) 

`count` - optional number, how many rows max to read from the file (if bigger than actual rows in file its ok)

```javascript
var Csvly = require("csvly");
var reader = new Csvly("test.csv");
reader.on('line', function(line) {
	console.log(line);
});
reader.on('end', function() {
	console.log('done');
});
reader.read(0,1);
```
in this example for test.csv:
```
one,two,three
```
line will be emitted once as: `{ '0': 'one', '1': 'two', '2': 'three' }`

In addition csvly has the following convenient methods:

`readAll()` reads all lines from the file

`readFirst(count)` read the first `count` rows from the begining of the file

### opts
csvly receives an options object as the second argument to its constructor which can contain:

* `encoding` - optional, default is utf8
* `eol` - optional end of line char, default is OS newline
* `headers` - optioanl array of values to use as csv headers. If given they will be the key's to the parsed object properties
* `firstLineIsHeaders` - optioanl boolean. Whether to use the first line as headers. If true it will be the key's to the parsed object properties. This option can not be given together with the header option - only one of them may be included in the opts, otherwise an error is thrown.

### example given headers array:
```javascript
var Csvly = require("csvly");
var reader = new Csvly("test.csv", {
	headers = ["first", "second", "third"]
});
reader.on('line', function(line) {
	console.log(line);
});
reader.on('end', function() {
	console.log('done');
});
reader.readAll();
```
in this example for test.csv:
```
one,two,three
```
line will be emitted once as: `{ 'first': 'one', 'second': 'two', 'third': 'three' }`

### example given first line as headers:
```javascript
var Csvly = require("csvly");
var reader = new Csvly("test.csv", {
	firstLineIsHeaders: true
});
reader.on('line', function(line) {
	console.log(line);
});
reader.on('end', function() {
	console.log('done');
});
reader.readAll();
```
in this example for test.csv:
```
one,two,three
a, b, c
```
line will be emitted once as: `{ 'one': 'a', 'two': 'b', 'three': 'c' }`