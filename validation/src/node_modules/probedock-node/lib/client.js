var _ = require('underscore'),
    fs = require('fs-extra'),
    q = require('q'),
    path = require('path');

module.exports = function(Config, payloadSerializer, publisher, TestRun, uid) {

  function validate(info) {

    info.config.validate(info.errors);

    if (!info.errors.length) {
      info.testRun.validate(info.errors);
    }

    return info;
  }

  function processTestRun(info) {

    var promise = q(info);

    if (!info.errors.length) {
      promise = promise.then(serializePayload).then(handlePayload).then(publishPayload);
    }

    return promise;
  }

  function serializePayload(info) {

    var deferred = q.defer();
    info.payload = payloadSerializer.v1(info.testRun);

    deferred.resolve(info);
    return deferred.promise;
  }

  function handlePayload(info) {

    var config = info.config;
    if (config.workspace) {
      var sharedWorkspace = config.workspace,
          workspace = path.join(sharedWorkspace, 'jasmine');

      fs.mkdirsSync(workspace);
      fs.writeFileSync(path.join(workspace, 'payload.json'), JSON.stringify(info.payload, null, 2), 'utf8');
    }

    return info;
  }

  function publishPayload(info) {

    if (!info.config.publish) {
      return info;
    }

    return publisher.upload(info.payload, info.config.getServerOptions()).then(function() {
      info.published = true;
      return info;
    });
  }

  return {
    loadConfig: function(configOverrides) {
      var config = new Config();
      config.load(configOverrides);
      return config;
    },

    startTestRun: function(config) {

      var testRun = new TestRun(config);
      testRun.uid = uid.load(config);
      testRun.start();

      return testRun;
    },

    process: function(testRun, config) {
      return q({ config: config, testRun: testRun, published: false, errors: [] })
        .then(validate)
        .then(processTestRun);
    },

    saveTestRun: function(filename, testRun, config) {
      fs.writeFileSync(filename, JSON.stringify({ testRun: testRun, config: config }));
    },

    loadTestRun: function(filename) {

      var data = JSON.parse(fs.readFileSync(filename, { encoding: 'utf-8' })),
          config = new Config(data.config);

      // TODO: improve test run serialization/deserialization
      var testRun = new TestRun(config);
      testRun.results = data.testRun.results;
      testRun.startTime = new Date(data.testRun.startTime);
      testRun.endTime = new Date(data.testRun.endTime);
      testRun.duration = data.testRun.duration;

      return { config: config, testRun: testRun };
    }
  };
};

module.exports['@require'] = [ 'config', 'payload', 'publisher', 'testRun', 'uid' ];
module.exports['@singleton'] = true;
