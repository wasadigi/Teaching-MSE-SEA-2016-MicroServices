var _ = require('underscore');

module.exports = function() {
  return {
    // Serialize a test run in the application/vnd.probedock.payload.v1+json media type.
    v1: function(testRun) {

      var payload = {
        projectId: testRun.projectApiId,
        version: testRun.projectVersion,
        duration: testRun.duration,
        results: _.reduce(testRun.results, function(memo, result) {

          var t = {
            n: result.name,
            f: result.fingerprint,
            p: result.passed,
            d: result.duration,
            c: result.category || null,
            g: result.tags || [],
            t: result.tickets || []
          };

          if (result.key) {
            t.k = result.key;
          }

          if (result.message) {
            t.m = result.message;
          }

          memo.push(t);
          return memo;
        }, [])
      };

      if (testRun.uid) {
        payload.reports = [ { uid: testRun.uid } ];
      }

      return payload;
    }
  };
};

module.exports['@require'] = [];
module.exports['@singleton'] = true;
