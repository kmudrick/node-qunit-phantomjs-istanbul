
Run QUnit tests in PhantomJS and capture istanbul code coverage metrics if available.

Asssumes you have pre-instrumented the code being tested.

This was originally forked from [node-qunit-phantomjs](https://github.com/jonkemp/node-qunit-phantomjs)

## Install

```
npm install --save-dev node-qunit-phantomjs-istanbul
```

### Using

```
var qunit = require('node-qunit-phantomjs');

qunit('test/js/tests.html', { 'coverageLocation': '/tmp/coverage.json' }, cb);

```
