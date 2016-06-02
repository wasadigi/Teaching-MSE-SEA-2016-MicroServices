var _ = require('underscore'),
    crypto = require('crypto');

module.exports = function() {

  function TestRun(config) {

    var projectOptions = config.getProjectOptions();
    this.projectApiId = projectOptions.apiId;
    this.projectVersion = projectOptions.version;

    _.extend(this, _.pick(projectOptions, 'category', 'tags', 'tickets'));

    if (config.testRunUid) {
      this.uid = config.testRunUid;
    }

    this.results = [];
  }

  function toArray(a) {
    return _.isArray(a) ? a : _.compact([ a ]);
  }

  function combineArrays() {
    var arrays = _.map(Array.prototype.slice.call(arguments), toArray);
    return _.union.apply(_, arrays);
  }

  function parseAnnotationValue(text, regexp) {
    var match = text.match(regexp);
    return match ? match[1] : null;
  }

  function parseAnnotationList(text, regexp, values) {
    do {
      match = text.match(regexp);
      if (match) {
        values.push(match[1]);
        text = text.replace(regexp, '');
      }
    } while (match);
  }

  var annotationRegexp = /\@probedock\(([^\(\)]*)\)/;

  function parseAnnotations(testName) {

    var match = null,
        annotation = {
          category: null,
          tags: [],
          tickets: []
        };

    do {
      match = testName.match(annotationRegexp);
      if (!match) {
        continue;
      }

      var text = match[1];
      if (text.match(/^[a-z0-9]+$/)) {
        annotation.key = text;
      } else {
        annotation.key = parseAnnotationValue(text, /key\=[\"\']?([^\s]+)[\"\']?/);
        annotation.category = parseAnnotationValue(text, /category\=[\"\']?([^\s]+)[\"\']?/) || annotation.category;
        parseAnnotationList(text, /tag\=[\"\']?([^\s]+)[\"\']?/, annotation.tags);
        parseAnnotationList(text, /ticket\=[\"\']?([^\s]+)[\"\']?/, annotation.tickets);
      }

      testName = testName.replace(annotationRegexp, '');
    } while (match);

    return annotation;
  }

  function stripAnnotations(testName) {
    return testName.replace(/\s*\@probedock\([^\(\)]*\)/g, '');
  }

  _.extend(TestRun.prototype, {

    start: function() {
      this.startTime = new Date().getTime();
    },

    add: function(key, name, passed, duration, options) {
      options = options || {};

      var annotation = parseAnnotations(name);

      var result = {
        key: key || annotation.key,
        name: stripAnnotations(name),
        originalName: name,
        passed: passed,
        duration: duration,
        numberOfResults: 1
      };

      var sha1 = crypto.createHash('sha1');
      sha1.update(options.nameParts ? options.nameParts.join('|||') : result.name);
      result.fingerprint = sha1.digest('hex');

      if (options.message) {
        result.message = options.message;
      }

      result.category = options.category || annotation.category || this.category || null;
      result.tags = combineArrays(options.tags, annotation.tags, this.tags);
      result.tickets = combineArrays(options.tickets, annotation.tickets, this.tickets);

      this.results.push(result);
      return result;
    },

    end: function() {
      this.endTime = new Date().getTime();
      if (this.startTime) {
        this.duration = this.endTime - this.startTime;
      }
    },

    validate: function(errors) {

      if (!this.projectApiId) {
        errors.push('Project API ID is not set');
      }

      if (!this.projectVersion) {
        errors.push('Project version is not set');
      }

      if (!this.results.length) {
        errors.push('No test result to send');
      }

      if (!this.startTime) {
        errors.push('Start time is not set; maybe you forgot to call testRun.start() when the test suite started');
      }

      if (!this.endTime) {
        errors.push('End time is not set; maybe you forgot to call testRun.end() when the test suite finished running');
      }

      var keys = {},
          duplicateKeys = {};

      _.each(this.results, function(result) {
        if (result.key && keys[result.key]) {
          if (!duplicateKeys[result.key]) {
            duplicateKeys[result.key] = [ keys[result.key] ];
          }
          duplicateKeys[result.key].push(result);
        } else {
          keys[result.key] = result;
        }
      });

      delete keys['undefined'];

      _.each(duplicateKeys, function(results, key) {
        errors.push('Test key "' + key + '" is used by ' + results.length + ' results: "' + _.map(results, function(result) {
          return result.name;
        }).join('", "') + '"');
      });
    }
  });

  return TestRun;
};

module.exports['@require'] = [];
module.exports['@singleton'] = true;
