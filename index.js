'use strict';

var path = require('path'),
    chalk = require('chalk'),
    childProcess = require('child_process'),
    phantomjs = require('phantomjs'),
    binPath = phantomjs.path;

module.exports = function (filepath, options, callback) {
    var opt = options || {},
        cb = callback || function () {},
        runner = './runner.js';

    var absolutePath = path.resolve(filepath),
        isAbsolutePath = absolutePath.indexOf(filepath) >= 0,
        childArgs = [];

    childArgs.push(
        path.join(__dirname, runner),
        (isAbsolutePath ? 'file:///' + absolutePath.replace(/\\/g, '/') : filepath)
    );

    if ( opt.coverageLocation ) {
        childArgs.push( path.resolve(opt.coverageLocation) );
    }

    var proc = childProcess.execFile(binPath, childArgs, function (err, stdout, stderr) {
        console.log('Testing ' + chalk.blue( path.relative(__dirname, filepath) ));

        if (stdout) {
            try {
                var out,
                    result,
                    message,
                    output;

                stdout.trim().split('\n').forEach(function(line) {
                    try{
                        out = JSON.parse(line.trim());
                        result = out.result;

                        message = 'Took ' + result.runtime + ' ms to run ' + result.total + ' tests. ' + result.passed + ' passed, ' + result.failed + ' failed.';

                        output = result.failed > 0 ? chalk.red(message) : chalk.green(message);

                        console.log(output);

                        if(out.exceptions) {
                            for(var test in out.exceptions) {
                                console.log('\n' + chalk.red('Test failed') + ': ' + chalk.red(test) + ': \n' + out.exceptions[test].join('\n  '));
                            }
                        }
                    } catch(e) {
                        line = line.trim(); // Trim trailing cr-lf
                        console.log(line);
                    }
                });
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
