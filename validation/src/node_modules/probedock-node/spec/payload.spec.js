var _ = require('underscore'),
    factory = require('../lib/payload');

describe('payload', function() {

  var sampleTestRun, serializer;
  beforeEach(function() {

    serializer = factory();

    sampleTestRun = {
      uid: 'yooayedee',
      duration: 1234,
      projectApiId: 'foo',
      projectVersion: '1.0.0',
      results: [
        {
          name: 'it should work',
          fingerprint: '5b956d31518a044cfdc6df2e99f9a2d8bf217a68',
          passed: true,
          duration: 1240,
          category: 'Karma',
          tags: [ 'yee', 'haw' ]
        },
        {
          name: 'it might work',
          fingerprint: 'f9147ee933be7261c8b4344d31aa7ad649d9b602',
          passed: false,
          message: 'it did not work',
          duration: 756,
          category: 'Jasmine',
          tickets: [ '100', '200', '300' ]
        },
        {
          key: 'qux',
          name: 'it should also work',
          fingerprint: '33b2ab88dcbb9cac6cfea5be6db00aaac578833f',
          passed: true,
          duration: 1000,
          message: 'it did actually work'
        }
      ]
    };

    sampleResult = {
      projectId: 'foo',
      version: '1.0.0',
      duration: 1234,
      reports: [
        { uid: 'yooayedee' }
      ],
      results: [
        {
          n: 'it should work',
          f: '5b956d31518a044cfdc6df2e99f9a2d8bf217a68',
          p: true,
          d: 1240,
          c: 'Karma',
          g: [ 'yee', 'haw' ],
          t: []
        },
        {
          n: 'it might work',
          f: 'f9147ee933be7261c8b4344d31aa7ad649d9b602',
          p: false,
          m: 'it did not work',
          d: 756,
          c: 'Jasmine',
          g: [],
          t: [ '100', '200', '300' ]
        },
        {
          k: 'qux',
          n: 'it should also work',
          f: '33b2ab88dcbb9cac6cfea5be6db00aaac578833f',
          p: true,
          m: 'it did actually work',
          d: 1000,
          c: null,
          g: [],
          t: []
        }
      ]
    };
  });

  describe('v1', function() {

    function serialize(testRun) {
      return serializer.v1(testRun || sampleTestRun);
    }

    it("should serialize a test run", function() {
      expect(serialize()).toEqual(sampleResult);
    });

    it("should omit optional properties", function() {

      delete sampleTestRun.uid;
      delete sampleResult.reports;

      _.each(sampleTestRun.results, function(result) {
        delete result.message;
        delete result.category;
        delete result.tags;
        delete result.tickets;
      });

      _.each(sampleResult.results, function(result) {
        delete result.m;
        result.c = null;
        result.g = [];
        result.t = [];
      });

      expect(serialize()).toEqual(sampleResult);
    });
  });
});
