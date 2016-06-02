var _ = require('underscore'),
    factory = require('../lib/publisher'),
    matchers = require('./support/matchers.helpers'),
    q = require('q');

describe('publisher', function() {

  var apiMock, publisher, sampleBody, sampleOptions;
  beforeEach(function() {

    matchers.addMatchers(this);

    apiMock = jasmine.createSpy();

    sampleBody = { foo: 'bar' };

    sampleOptions = {
      apiUrl: 'http://example.com/api',
      apiToken: 'foo'
    };

    publisher = factory(apiMock);
  });

  describe('upload', function() {

    function expectedRequestOptions(body, options) {

      var serializedBody = JSON.stringify(body);

      return _.extend({}, options || sampleOptions, {
        path: '/publish',
        method: 'POST',
        body: serializedBody,
        headers: {
          'Content-Type': 'application/vnd.probedock.payload.v1+json',
          'Content-Length': serializedBody.length
        }
      });
    }

    function testUpload(payload, options, expectedResult, callback) {

      var fulfilledSpy = jasmine.createSpy('success'),
          rejectedSpy = jasmine.createSpy('failure');

      publisher.upload(payload, options).then(fulfilledSpy, rejectedSpy);

      waitsFor(function() {
        return fulfilledSpy.calls.length || rejectedSpy.calls.length;
      }, 'the upload to be completed', 100);

      runs(function() {
        var spy = expectedResult ? fulfilledSpy : rejectedSpy;
        expect(spy).toHaveBeenCalled();
        if (spy.calls.length) {
          callback(spy.calls[0].args[0]);
        }
      });
    }

    it("should upload a payload", function() {
      apiMock.andReturn(q({ statusCode: 202 }));
      testUpload(sampleBody, sampleOptions, true, function(res) {
        expect(res).toBe(undefined);
        expect(apiMock).toHaveBeenCalledWith(expectedRequestOptions(sampleBody));
      });
    });

    it("should reject the returned promise if the upload fails", function() {
      apiMock.andReturn(q.reject(new Error('bug')));
      testUpload(sampleBody, sampleOptions, false, function(err) {
        expect(err).toBeAnError('bug');
        expect(apiMock).toHaveBeenCalledWith(expectedRequestOptions(sampleBody));
      });
    });

    it("should reject the returned promise if the response has a different status code than 202", function() {
      apiMock.andReturn(q({ statusCode: 201, body: 'yeehaw' }));
      testUpload(sampleBody, sampleOptions, false, function(err) {
        expect(err).toBeAnError('Server responded with unexpected status code 201 (response: yeehaw)');
        expect(apiMock).toHaveBeenCalledWith(expectedRequestOptions(sampleBody));
      });
    });
  });
});
