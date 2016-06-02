var apiPrefix = process.env.CLOCK_API_PREFIX || "http://localhost:8080/api";

var assert = require("assert");
var api = require('supertest-as-promised')(apiPrefix);
var expect = require('chai').expect;
var finish_test = require("../supertest-helper");


console.log("Using API prefix: " + apiPrefix);

describe("Basic scenarios for Clock micro-service", function() {

	describe("The clock micro-service", function() {
		it("should expose a REST endpoint on /clock", function(done) {
			return api
			.get("/clock")
			.expect(200)
			.end( finish_test(done) )
		});

		it("should return the current time via the REST endpoint on /clock", function(done) {
			api
			.get("/clock")
			.expect(200)
			.then( function (response ) {
				var payload = response.body;
				expect(payload).to.be.an('object');
				expect(payload.date).to.not.be.undefined;
				done();
			})
			.catch(function(err) {
        done.fail(err);
      })
		});

		it("should reject requests to wrong URIs", function(done) {
			return api
			.get("/ThisIsAnExampleOfAURINotKnownByTheService")
			.expect(404)
			.end( finish_test(done) ) 
		});

	});

});

