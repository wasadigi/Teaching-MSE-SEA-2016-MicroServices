var assert = require("assert");
var api = require('supertest-as-promised');
var expect = require('chai').expect;

var finish_test = require("../supertest-helper");

var apiPrefix =  process.env.GAMEDOCK_API_PREFIX || "http://localhost:8080/api";

/**
 *  This function issues a POST request to the specified URL. It sends the
 *  payload parameter in the request body and the authorization parameter
 *  in the Authorization header
 *
 * @param {String} url the URL where to POST the payload
 * @param {Object} payload a JavaScript object that will be serialized in JSON
 * @param {String} authorization the value of the Authorization header
 * @returns {Promise} a promise that will be either resolved or rejected by supertest.
 *  When the promise resolves, it will return an object with a url property, indicating
 *  the location of the created resource
 */
function create(url, payload, authorization) {
  return api(url)
          .post("")
          .set('Content-Type', 'application/json')
          .set('Authorization', authorization)
          .send(payload)
          .expect(201)
          .then(function (response) {
            var createdResourceUrl = response.header["location"];
            return {
              url: createdResourceUrl
            };
          });
}

function createApplication(payload, authorization) {
  return create(apiPrefix + "/applications/", payload, authorization)
          .then(function (createdApplication) {
            var applicationId = createdApplication.url.replace(/.*\/(.*)/, "$1");
            var credentials = new Buffer(applicationId + ":").toString('base64');
            return {
              url: createdApplication.url,
              credentials: credentials
            };
          });
}

function createOrganization(payload, authorization) {
  var applicationId = new Buffer(authorization, 'base64').toString("ascii").replace(/(.*):/, "$1");
  return create(apiPrefix + "/organizations/", payload, authorization)
          .then(function (createdOrganization) {
            var organizationId = createdOrganization.url.replace(/.*\/(.*)/, "$1");
            var credentials = new Buffer(applicationId + ":" + organizationId).toString('base64');
            console.log(credentials);
            return {
              url: createdOrganization.url,
              credentials: credentials
            };
          });
}

function createBadge(payload, authorization) {
  return create(apiPrefix + "/badges/", payload, authorization)
}

function createPointScale(payload, authorization) {
  return create(apiPrefix + "/pointScales/", payload, authorization)
          .then(function (createdPointScale) {
            return {
              url: createdPointScale.url,
              credentials: authorization
            };
          });
}

function createLevel(pointScaleId, payload, authorization) {
  return create(apiPrefix + "/pointScales/" + pointScaleId + "/levels/", payload, authorization)
          .then(function (createdLevel) {
            return {
              url: createdLevel.url,
              credentials: authorization
            };
          });
}

function get(url, authorization) {
  return api(url)
          .get("")
          .set('Accept', 'application/json')
          .set('Authorization', authorization)
          .expect(200);
}

function getBadges(authorization) {
  return get(apiPrefix + "/badges/", authorization);
}

function getPointScales(authorization) {
  return get(apiPrefix + "/pointScales/", authorization);
}

function getLevels(pointScaleId, authorization) {
  return get(apiPrefix + "/pointScales/" + pointScaleId + "/levels/", authorization);
}

describe("Setup scenarios", function () {

  describe("The simple setup scenario", function () {
    it("should validate the creation of 1 application", function (done) {
      var app = {name: "Gamified Application"};
      var credentials = "";
      createApplication(app, credentials)
              .then(function (createdApplication) {
                console.log("Application created at: " + createdApplication.url + " with credentials: " + createdApplication.credentials);
                done();
              })
              .catch(function (err) {
                done.fail(err);
              });
    });

    it("should validate the creation of 1 application with 1 linked organization", function (done) {
      var app = {name: "Gamified Application"};
      var org = {name: "Gamified Application's Customer Company"};
      var credentials = "";
      createApplication(app, credentials)
              .then(function (createdApplication) {
                console.log("Application created at: " + createdApplication.url + " with credentials: " + createdApplication.credentials);
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function (createdOrganization) {
                console.log("Organization created at: " + createdOrganization.url + " with credentials: " + createdOrganization.credentials);
                done();
              })
              .catch(function (err) {
                done.fail(err);
              });
    });

    it("should validate the creation of 1 application with 1 linked organization with 1 linked badge", function (done) {
      var app = {name: "Gamified Application"};
      var org = {name: "Gamified Application's Customer Company"};
      var badge = {name: "Hero", description: "Because you did something good.", picture: "no url yet"};
      var credentials = "";
      createApplication(app, credentials)
              .then(function (createdApplication) {
                console.log("Application created at: " + createdApplication.url + " with credentials: " + createdApplication.credentials);
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function (createdOrganization) {
                console.log("Organization created at: " + createdOrganization.url + " with credentials: " + createdOrganization.credentials);
                return createBadge(badge, createdOrganization.credentials);
              })
              .then(function (createdBadge) {
                console.log("Badge created at: " + createdBadge.url);
                done();
              })
              .catch(function (err) {
                done.fail(err);
              });
    });


    it("should validate the creation of 1 application with 1 linked organization with 1 linked badge as well as the read access to these resources", function (done) {
      var app = {name: "Gamified Application"};
      var org = {name: "Gamified Application's Customer Company"};
      var badge = {name: "Hero", description: "Because you did something good.", picture: "no url yet"};
      var noCredentials = "";
      var appCredentials;
      var orgCredentials;
      createApplication(app, noCredentials)
              .then(function (createdApplication) {
                console.log("Application created at: " + createdApplication.url + " with credentials: " + createdApplication.credentials);
                appCredentials = createdApplication.credentials;
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function (createdOrganization) {
                orgCredentials = createdOrganization.credentials;
                console.log("Organization created at: " + createdOrganization.url + " with credentials: " + createdOrganization.credentials);
                return createBadge(badge, createdOrganization.credentials);
              })
              .then(function (createdBadge) {
                console.log("Badge created at: " + createdBadge.url);
                return getBadges(orgCredentials);
              })
              .then(function ( response ) {
                var badges = response.body;
                console.log(badges);
                expect(badges).to.be.an('array');
                expect(badges).to.have.length.of(1);
                done();
              })
              .catch(function (err) {
                done.fail(err);
              });
    });

    it("should validate the creation of 1 application with 1 linked organization with 1 linked point scale", function (done) {
      var app = {name: "Gamified Application"};
      var org = {name: "Gamified Application's Customer Company"};
      var pointScale = {name: "First Test", description: "Because you run your first test."};
      var credentials = "";
      createApplication(app, credentials)
              .then(function (createdApplication) {
                console.log("Application created at: " + createdApplication.url + " with credentials: " + createdApplication.credentials);
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function (createdOrganization) {
                console.log("Organization created at: " + createdOrganization.url + " with credentials: " + createdOrganization.credentials);
                return createPointScale(pointScale, createdOrganization.credentials);
              })
              .then(function (createdPointScale) {
                console.log("Point scale created at: " + createdPointScale.url);
                done();
              })
              .catch(function (err) {
                done.fail(err);
              });
    });

    it("should validate the creation of 1 application with 1 linked organization with 1 linked point scale as well as the read access to these resources", function (done) {
      var app = {name: "Gamified Application"};
      var org = {name: "Gamified Application's Customer Company"};
      var pointScale = {name: "First Test", description: "Because you run your first test."};
      var noCredentials = "";
      var appCredentials;
      var orgCredentials;
      createApplication(app, noCredentials)
              .then(function (createdApplication) {
                console.log("Application created at: " + createdApplication.url + " with credentials: " + createdApplication.credentials);
                appCredentials = createdApplication.credentials;
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function (createdOrganization) {
                orgCredentials = createdOrganization.credentials;
                console.log("Organization created at: " + createdOrganization.url + " with credentials: " + createdOrganization.credentials);
                return createPointScale(pointScale, createdOrganization.credentials);
              })
              .then(function (createdPointScale) {
                console.log("Point scale created at: " + createdPointScale.url);
                return getPointScales(orgCredentials);
              })
              .then(function ( response ) {
                var pointScales = response.body;
                console.log(pointScales);
                expect(pointScales).to.be.an('array');
                expect(pointScales).to.have.length.of(1);
                done();
              })
              .catch(function (err) {
                done.fail(err);
              });
    });

    it("should validate the creation of 1 application with 1 linked organization with 1 linked point scale with 1 linked level", function (done) {
      var app = {name: "Gamified Application"};
      var org = {name: "Gamified Application's Customer Company"};
      var pointScale = {name: "First Test", description: "Because you run your first test."};
      var lvl = {name: "Probe Dock User", description: "Because in Probe Dock you trust", points: 0, picture: "no url yet"};
      var credentials = "";
      createApplication(app, credentials)
              .then(function (createdApplication) {
                console.log("Application created at: " + createdApplication.url + " with credentials: " + createdApplication.credentials);
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function (createdOrganization) {
                console.log("Organization created at: " + createdOrganization.url + " with credentials: " + createdOrganization.credentials);
                return createPointScale(pointScale, createdOrganization.credentials);
              })
              .then(function (createdPointScale) {
                console.log("Point scale created at: " + createdPointScale.url + " with credentials: " + createdPointScale.credentials);
                var pointScaleId = createdPointScale.url.replace(/.*\/(.*)/, "$1");
                return createLevel(pointScaleId, lvl, createdPointScale.credentials);
              })
              .then(function (createdLevel) {
                console.log("Level created at: " + createdLevel.url);
                done();
              })
              .catch(function (err) {
                done.fail(err);
              });
    });

    it("should validate the creation of 1 application with 1 linked organization with 1 linked point scale with 1 linked level as well as the read access to these resources", function (done) {
      var app = {name: "Gamified Application"};
      var org = {name: "Gamified Application's Customer Company"};
      var pointScale = {name: "First Test", description: "Because you run your first test."};
      var lvl = {name: "Probe Dock User", description: "Because in Probe Dock you trust", points: 0, picture: "no url yet"};
      var noCredentials = "";
      var appCredentials;
      var orgCredentials;
      createApplication(app, noCredentials)
              .then(function (createdApplication) {
                console.log("Application created at: " + createdApplication.url + " with credentials: " + createdApplication.credentials);
                appCredentials = createdApplication.credentials;
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function (createdOrganization) {
                orgCredentials = createdOrganization.credentials;
                console.log("Organization created at: " + createdOrganization.url + " with credentials: " + createdOrganization.credentials);
                return createPointScale(pointScale, createdOrganization.credentials);
              })
              .then(function (createdPointScale) {
                console.log("Point scale created at: " + createdPointScale.url);
                var pointScaleId = createdPointScale.url.replace(/.*\/(.*)/, "$1");
                return createLevel(pointScaleId, lvl, createdPointScale.credentials);
              })
              .then(function (createdLevel) {
                console.log("Level created at: " + createdLevel.url);
                var pointScaleId = createdLevel.url.replace(/.*\/(.*)\/.*\/.*/, "$1");
                return getLevels(pointScaleId, createdLevel.credentials)
              })
              .then(function ( response ) {
                var levels = response.body;
                console.log(levels);
                expect(levels).to.be.an('array');
                expect(levels).to.have.length.of(1);
                done();
              })
              .catch(function (err) {
                done.fail(err);
              });
    });

  });

});
