var Jasmine = require('jasmine');
var probedock = require('probedock-node').client;

var fs = require('fs');
var path = require('path');

/** 
 * Load the Probe Dock config from the parent directory
 */
process.env.PROBEDOCK_CONFIG="../../probedock.yml";

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
 * Load the Probe Dock configuration file. Probe Dock will look for
 * a file named "probedock.yml" in the current directory. The file should
 * contain the following YAML fragment, where apiId is the unique id assigned
 * by Probe Dock to your project and where server is the hostname of your
 * Probe Dock server.
 *
 * project:
 *   apiId: kvr0r1t0ydqx
 *   version: 1.0.0
 *   server: trial.probedock.io
 */
var config = probedock.loadConfig();

/**
 * Start the Probe Dock test run. After making this call, it is possible to
 * add test results when they are notified via Mocha events. We also set the
 * category for our tests to "Mocha".
 */
var probeDockTestRun = probedock.startTestRun(config);
probeDockTestRun.category = "Jasmine2";

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
	/**
	 * Tell the Probe Dock client that we are done executing all tests. Time to
	 * process the results (i.e. to send them to the server).
	 */
	probeDockTestRun.end();
	probedock.saveTestRun("./test-run-dump.json", probeDockTestRun, config);
	probedock.process(probeDockTestRun, config).then(function(logInfo, startTime) {
		console.log("Test results sent to Probe Dock server.");
		console.log(logInfo);
	}).fail(function(logError) {
		console.log("There was an error while sending the test results to the Probe Dock server.");
		console.log(logError);
	}).fin(function() {});
});

/**
 * With Jasmine 2, we can get the test results by creating a custom reporter. It is possible
 * to plug several reporters at the same time, so we can write one that does not output anything
 * on the console and only keeps Probe Dock up-to-date.
 */
var probedockReporter = {
	/**
	 * Keep track of the nested test suites. We will use this information to create
	 * tags for our Probe Dock tags.
	 */
	context: [],
	
	/**
	 * Jasmine does not provide test execution time in its results, so we keep track
	 * of time ourselves.
	 */
	timer: 0,
	jasmineStarted: function(suiteInfo) {},
	suiteStarted: function(result) {
		this.context.push(result.description);
	},
	specStarted: function(result) {
		timer = new Date();
	},
	specDone: function(result) {
		duration = new Date() - timer;
		var metadata = getTestMetadataForProbeDock(result, this.context);
		if (result.failedExpectations.length === 0) {
			probeDockTestRun.add(null, metadata.name, true, duration, {
				tags: metadata.tags
			});
		} else {
			probeDockTestRun.add(null, metadata.name, false, duration, {
				tags: metadata.tags,
				message: metadata.message,
			});
		}
	},
	suiteDone: function(result) {
		this.context.pop();
	},
	jasmineDone: function() {
	}
};

/**
 * Plug out custom reporter
 */
jasmine.addReporter(probedockReporter);

/**
 * Note that adding one custom reporter will disable the default Console
 * reporter. We can add it back
 */
jasmine.configureDefaultReporter({});

/**
 * We can now launch the Jasmine test runner
 */
jasmine.execute();

/**
 * This function prepares metadata for Probe Dock. In our specs, we have tests,
 * within suites, within suites, within suites, etc. We create a tag for each
 * level (this is interesting, for instance if the developer is using sub-suites
 * for sub-systems). For the test name, we concateneate the name of the suite
 * ("describe") with the name of the test ("it").
 */

function getTestMetadataForProbeDock(test, context) {

	/**
	 * Probe Docks cannot contain spaces, so we replace them with hyphens
	 */

	function spaceToHyphen(text) {
		return text.replace(/\s/g, '-');
	}

	var metadata = {};
	var tags = [];
	var message = "";
	var stack = "";

	if (test.failedExpectations.length > 0) {
		message = test.failedExpectations.length + " failed expectation(s):\n";
		for (var i = 0; i < test.failedExpectations.length; i++) {
			message += "- " + test.failedExpectations[i].message;
		}
		stack = test.failedExpectations[0].stack;
	}

	metadata.name = context[context.length - 1] + " " + test.description;
	metadata.tags = context.map(spaceToHyphen);
	metadata.message = message + "\n\nStack trace (1st failed expectation):\n" + stack;

	return metadata;
}
