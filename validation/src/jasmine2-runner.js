var Jasmine = require('jasmine');

var fs = require('fs');
var path = require('path');

/**
 * There is an issue when using Jasmine 2 to run supertest (collision)
 * See this link for a description and a solution (applied in this project)
 * https://github.com/jasmine/jasmine-npm/issues/31
 *
/*

/**
 * We use Jasmine programmatically, so we create an object that
 * exposes functionality of the testing framework
 */
var jasmine = new Jasmine();

/**
 * We need to tell Jasmine where are the spec files (the files containing
 * the tests). We state that all files under the "test" directory with
 * a .js extension should be considered.
 */
jasmine.loadConfig({
	spec_dir: 'spec',
	spec_files: ['**/*.js'],
	helpers: ['helpers/**/*.js']
});


/**
 * By default, if an exception is thrown in an asynchronous function (in the
 * System-Under-Test), the whole Jasmine test run is interrupted. Here, we
 * handle the uncaughtException to continue.
 */
process.on('uncaughtException',function(e) {
  console.log('Caught unhandled exception (probably in some of your async code): ' + e.toString());
  console.log(e.stack);
});


jasmine.onComplete(function(passed) {
	console.log("Validation completed.");
});


/**
 * Note that adding one custom reporter will disable the default Console
 * reporter. We can add it back
 */
jasmine.configureDefaultReporter({});

/**
 * We can now launch the Jasmine test runner
 */
jasmine.execute();
