// # probedock-node
// Node.js library to write new probes for Probe Dock.
//
// This module is not standalone;
// it provides reusable components to publish test results to a Probe Dock server.
// These components can be used from any other Node.js module to build a full-fledged Probe Dock probe.
var ioc = require('./ioc');

// ## High-Level Interface

// The [client](client.js.html) provides a simple interface which should allow
// any Probe Dock probe to collect and publish test results.
// This is what you should use unless you need more control over the process with the low-level components.
exports.client = ioc.create('client');

// ## Low-Level Components

// A [Config](config.js.html) object can load and validate the Probe Dock probe
// configuration files as defined in [the integration guide](https://github.com/probedock/probedock-probes).
exports.Config = ioc.create('config');

// A [TestRun](testRun.js.html) object can be used to collect test results from a testing framework like Jasmine.
exports.TestRun = ioc.create('testRun');

// The [api](api.js.html) module provides functions to communicate with the Probe Dock API.
exports.api = ioc.create('api');

// The [payload serializer](payload.js.html) is used to serialize the results of a test run into the
// application/vnd.probedock.payload.v1+json media type accepted by the Probe Dock API.
exports.payload = ioc.create('payload');

// The [publisher](publisher.js.html) knows how to publish a serialized payload of test results to a Probe Dock server using the API module.
exports.publisher = ioc.create('publisher');

// The [uid](uid.js.html) module can load a test run UID from an environment variable or configuration file.
// This UID can be added to test runs to group several test runs under the same report in a Probe Dock server.
exports.uid = ioc.create('uid');

// The current [semantic version](http://semver.org) is exported.
exports.version = require('../package').version;
