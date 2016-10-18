var fs = require('fs'),
    path = require('path'),
    CLIEngine = require('eslint').CLIEngine;

module.exports = function(config) {
    if (typeof config !== 'object') {
        config = {};
    }

    if (!Array.isArray(config.extensions)) {
        config.extensions = ['.js'];
    }

    var cli = new CLIEngine({ configFile: './.eslintrc' });
    var cwd = process.cwd();

    return {
        type: 'eslint',
        review: function(files, done) {
            var log = {
                success: true,
                errors: []
            };

            var filter = files.filter(function(filename) {
                return config.extensions.indexOf(path.extname(filename)) !== -1;
            });

            try {
                var report = cli.executeOnFiles(filter);
                var count = report.errorCount + report.warningCount;

                if (count) {
                    report.results.forEach(function(result) {
                        result.messages.forEach(function(message) {
                            if (message.severity === 2) { // include only rules with 'error' severity
                                log.errors.push({
                                    filename: result.filePath.replace(cwd + '/', ''),
                                    line: message.line,
                                    column: message.column,
                                    rule: message.ruleId,
                                    message: String(message.message).replace("\n", '')
                                });
                            }
                        });
                    });
                }
            } catch (error) {
                log.errors.push({
                    filename: 'ESLint',
                    line: 0,
                    column: 0,
                    rule: '',
                    message: error.message
                });
            }

            if (log.errors.length) {
                log.success = false;
            }

            done(log);
        }
    };
};
