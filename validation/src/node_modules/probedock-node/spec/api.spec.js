var _ = require('underscore'),
    factory = require('../lib/api'),
    matchers = require('./support/matchers.helpers'),
    q = require('q');

describe('api', function() {

  var api, requestMock, response;
  beforeEach(function() {

    matchers.addMatchers(this);

    responses = [];
    requestMock = jasmine.createSpy();
    requestMock.andCallFake(function(options, callback) {
      if (response instanceof Error) {
        callback(response);
      } else {
        callback(undefined, response, response.body);
      }
    });

    api = factory(requestMock);
  });

  function testRequest(options, expectedResult, callback) {

    var fulfilledSpy = jasmine.createSpy('success'),
        rejectedSpy = jasmine.createSpy('failure');

    api(options).then(fulfilledSpy, rejectedSpy);

    waitsFor(function() {
      return fulfilledSpy.calls.length || rejectedSpy.calls.length;
    }, 'the request to be completed', 100);

    runs(function() {
      var spy = expectedResult ? fulfilledSpy : rejectedSpy;
      expect(spy).toHaveBeenCalled();
      if (spy.calls.length) {
        callback(spy.calls[0].args[0]);
      }
    });
  }

  function setResponse(statusCode, body) {
    response = {
      statusCode: statusCode,
      body: JSON.stringify(body)
    };
  }

  function setErrorResponse(message) {
    response = new Error(message);
  }

  describe("request", function() {

    var validOptions;
    beforeEach(function() {
      validOptions = {
        apiUrl: 'http://example.com/api',
        apiToken: 'foo',
        path: 'resource',
        method: 'POST',
        body: { yee: 'haw' },
        json: true
      };
    });

    it("should make the request", function() {

      setResponse(201, { foo: 'bar' });

      testRequest(validOptions, true, function(res) {

        expect(requestMock.calls.length).toEqual(1);

        expect(requestMock.calls[0].args[0]).toEqual({
          url: 'http://example.com/api/resource',
          method: 'POST',
          body: { yee: 'haw' },
          json: true,
          headers: {
            Authorization: 'Bearer foo'
          }
        });

        expect(res.statusCode).toEqual(201);
        expect(JSON.parse(res.body)).toEqual({ foo: 'bar' });
      });
    });

    it("should not reject the returned promise if the status code of the response indicates failure", function() {

      setResponse(500, { foo: 'bar' });

      testRequest(validOptions, true, function(res) {

        expect(requestMock.calls.length).toEqual(1);

        expect(requestMock.calls[0].args[0]).toEqual({
          url: 'http://example.com/api/resource',
          method: 'POST',
          body: { yee: 'haw' },
          json: true,
          headers: {
            Authorization: 'Bearer foo'
          }
        });

        expect(res.statusCode).toEqual(500);
        expect(JSON.parse(res.body)).toEqual({ foo: 'bar' });
      });
    });

    it("should reject the returned promise if the request fails", function() {

      setErrorResponse('bug');

      testRequest(validOptions, false, function(err) {

        expect(requestMock.calls.length).toEqual(1);

        expect(requestMock.calls[0].args[0]).toEqual({
          url: 'http://example.com/api/resource',
          method: 'POST',
          body: { yee: 'haw' },
          json: true,
          headers: {
            Authorization: 'Bearer foo'
          }
        });

        expect(err).toBeAnError('bug');
      });
    });

    it("should not allow giving an URL", function() {
      testRequest(_.extend(validOptions, { url: 'http://example.com' }), false, function(err) {
        expect(err).toBeAnError('The target URL must not be given directly, but separately as the "apiUrl" and "path" options');
      });
    });

    it("should require the apiUrl option", function() {
      testRequest(_.omit(validOptions, 'apiUrl'), false, function(err) {
        expect(err).toBeAnError('The root of the Probe Dock API must be given as the "apiUrl" option');
      });
    });

    it("should require the path option", function() {
      testRequest(_.omit(validOptions, 'path'), false, function(err) {
        expect(err).toBeAnError('The path to the Probe Dock API resource must be given as the "path" option');
      });
    });

    it("should require the apiToken option", function() {
      testRequest(_.omit(validOptions, 'apiToken'), false, function(err) {
        expect(err).toBeAnError('The Probe Dock API authentication token must be given as the "apiToken" option');
      });
    });
  });
});
