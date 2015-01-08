'use strict';

var path = require('path'),
    chalk = require('chalk'),
    childProcess = require('child_process'),
    phantomjs = require('phantomjs'),
    binPath = phantomjs.path;

module.exports = function (filepath, options, callback) {
    var opt = options || {},
        cb = callback || function () {},
        runner = './node_modules/qunit-phantomjs-runner/runner-json.js';

    if (opt.verbose) {
        runner = './node_modules/qunit-phantomjs-runner/runner-list.js';
    }

    var absolutePath = path.resolve(filepath),
        isAbsolutePath = absolutePath.indexOf(filepath) >= 0,
        childArgs = [];

    if (opt['phantomjs-options'] && opt['phantomjs-options'].length) {
        childArgs.push( opt['phantomjs-options'] );
    }

    childArgs.push(
        path.join(__dirname, runner),
        (isAbsolutePath ? 'file:///' + absolutePath.replace(/\\/g, '/') : filepath)
    );

    if ( opt.timeout ) {
        childArgs.push( opt.timeout );
    }

    var proc = childProcess.execFile(binPath, childArgs, function (err, stdout, stderr) {
        console.log('Testing ' + chalk.blue( path.relative(__dirname, filepath) ));

        if (stdout) {
            try {
                var out,
                    result;

                if (stdout.indexOf('{') !== -1) {
                    out = JSON.parse(stdout.trim());
                    result = out.result;

                    console.log('Took ' + result.runtime + ' ms to run ' + chalk.blue(result.total) + ' tests. ' + chalk.green(result.passed) + ' passed, ' + chalk.red(result.failed) + ' failed.');

                    if(out.exceptions) {
                        for(var test in out.exceptions) {
                            console.log('\n' + chalk.red('Test failed') + ': ' + chalk.red(test) + ': \n' + out.exceptions[test].join('\n  '));
                        }
                    }
                } else {
                    stdout = stdout.trim(); // Trim trailing cr-lf
                    console.log(stdout);
                }
            } catch (e) {
                this.emit('error', new Error(e));
            }
        }

        if (stderr) {
            console.log(stderr);
        }

        if (err) {
            console.log(err);
        }
    }.bind(this));

    proc.on('close', function (code) {
        return cb(code);
    });
};
