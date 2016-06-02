var apiPrefix =  process.env.GAMEDOCK_API_PREFIX || "http://localhost:8080/api";

var assert = require('assert');
var api = require('supertest-as-promised')(apiPrefix);
var expect = require('chai').expect;

var finish_test = require('../supertest-helper');

function create(url, payload, authorization) {
  return api
          .post(url)
          .set('Content-Type', 'application/json')
          .set('Authorization', authorization)
          .send(payload)
          .expect(201)
          .then(function(response) {
            var createdResourceUrl = response.header['location'];
            var createdResourcePayload = response.body;
            return {
              url: createdResourceUrl,
              payload: createdResourcePayload
            };
          });
}

function createApplication(payload, authorization) {
  return create("/applications/", payload, authorization)
          .then(function(createdApplication) {
            var applicationId = createdApplication.url.replace(/.*\/(.*)/, '$1');
            var credentials = new Buffer(applicationId + ':').toString('base64');
            return {
              url: createdApplication.url,
              payload: createdApplication.payload,
              credentials: credentials
            };
          });
}

function createOrganization(payload, authorization) {
  var applicationId = new Buffer(authorization, 'base64').toString('ascii').replace(/(.*):/, '$1');
  return create('/organizations/', payload, authorization)
          .then(function(createdOrganization) {
            var organizationId = createdOrganization.url.replace(/.*\/(.*)/, '$1');
            var credentials = new Buffer(applicationId + ':' + organizationId).toString('base64');
            return {
              url: createdOrganization.url,
              payload: createdOrganization.payload,
              credentials: credentials
            };
          });
}

function createPointScale(payload, authorization) {
  return create('/pointScales/', payload, authorization)
          .then(function(createdPointScale) {
            var credentials = authorization;
            return {
              url: createdPointScale.url,
              payload: createdPointScale.payload,
              credentials: credentials
            }
          });
}

function createLevel(pointScaleId, payload, authorization) {
  return create('/pointScales/' + pointScaleId + "/levels/", payload, authorization)
          .then(function(createdLevel) {
            var credentials = authorization;
            return {
              url: createdLevel.url,
              payload: createdLevel.payload,
              credentials: credentials
            }
          });
}

function get(url, authorization) {
  return api
          .get(url)
          .set('Accept', 'application/json')
          .set('Authorization', authorization)
          .expect(200);
}

function getLevels(pointScaleId, authorization) {
  return get('/pointScales/' + pointScaleId + "/levels/", authorization);
}

function getLevel(pointScaleId, levelId, authorization) {
  return get('/pointScales/' + pointScaleId + "/levels/" + levelId, authorization);
}

function update(url, payload, authorization) {
  return api
          .put(url)
          .set('Content-Type', 'application/json')
          .set('Authorization', authorization)
          .send(payload)
          .expect(200)
          .then(function(response) {
            var updatedResourceUrl = response.header['location'];
            var updatedResourcePayload = response.body;
            return {
              url: updatedResourceUrl,
              payload: updatedResourcePayload
            };
          });
}

function updateLevel(pointScaleId, levelId, payload, authorization) {
  return update('/pointScales/' + pointScaleId + '/levels/' + levelId, payload, authorization)
          .then(function(updatedLevel) {
            var credentials = authorization;
            return {
              url: updatedLevel.url,
              payload: updatedLevel.payload,
              credentials: credentials
            }
          });
}

function remove(url, authorization) {
  return api
          .delete(url)
          .set('Authorization', authorization)
          .expect(204);
}

function removeLevel(pointScaleId, levelId, authorization) {
  return remove('/pointScales/' + pointScaleId + '/levels/' + levelId, authorization);
}

describe('Levels REST endpoint', function() {

  describe('GET levels', function() {

    describe('Authorization', function() {

      it('should be refused in case of missing credentials', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var location = createdPointScale.url;
  								var pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return api
            				.get('/pointScales' + '/' + pointScaleId + '/levels')
            				.set('Accept', 'application/json')
            				.expect(401);
                })
                .then(function() {
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should be refused in case of wrong credentials', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var authorization = new Buffer('<none>').toString('base64');
                  var location = createdPointScale.url;
  								var pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return api
            				.get('/pointScales' + '/' + pointScaleId + '/levels')
            				.set('Accept', 'application/json')
                    .set('Authorization', authorization)
            				.expect(401);
                })
                .then(function() {
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

  	});

    describe('Specification', function() {

      it('should return a 200 HTTP status code in case of successful GET processing', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var authorization = new Buffer('<none>').toString('base64');
                  var location = createdPointScale.url;
  								var pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return getLevels(pointScaleId, createdPointScale.credentials);
                })
                .then(function() {
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should return an array', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var authorization = new Buffer('<none>').toString('base64');
                  var location = createdPointScale.url;
  								var pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return getLevels(pointScaleId, createdPointScale.credentials);
                })
                .then(function(response) {
                	var levels = response.body;
  								expect(levels).to.be.an('array');
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
      });

      it('should return an empty array when no level exists', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var authorization = new Buffer('<none>').toString('base64');
                  var location = createdPointScale.url;
  								var pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return getLevels(pointScaleId, createdPointScale.credentials);
                })
                .then(function(response) {
                	var levels = response.body;
  								expect(levels).to.be.empty;
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should not return an empty array when levels do exist', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'};
        var pointScaleId = -1;
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var authorization = new Buffer('<none>').toString('base64');
                  var location = createdPointScale.url;
  								pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(pointScaleId, lvl, createdPointScale.credentials);
                })
                .then(function(createdLevel) {
                  return getLevels(pointScaleId, createdLevel.credentials);
                })
                .then(function(response) {
                	var levels = response.body;
  								expect(levels).to.not.be.empty;
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should return a one-sized array when only one level does exist', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'};
        var pointScaleId = -1;
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var authorization = new Buffer('<none>').toString('base64');
                  var location = createdPointScale.url;
  								pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(pointScaleId, lvl, createdPointScale.credentials);
                })
                .then(function(createdLevel) {
                  return getLevels(pointScaleId, createdLevel.credentials);
                })
                .then(function(response) {
                	var levels = response.body;
  								expect(levels).to.have.lengthOf(1);
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

  	});

    describe('Pagination', function() {

      it('should return custom HTTP pagination headers', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var authorization = new Buffer('<none>').toString('base64');
                  var location = createdPointScale.url;
  								var pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return getLevels(pointScaleId, createdPointScale.credentials);
                })
                .then(function(response) {
                	var headers = response.headers;
  								expect(headers['x-pagination-page']).to.not.be.undefined;
  								expect(headers['x-pagination-page-size']).to.not.be.undefined;
  								expect(headers['x-pagination-total']).to.not.be.undefined;
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
      });

      it('should be possible to sort items', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
        var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = [
          {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'},
          {name: 'Certified Probe Dock User', description: 'Because in Probe Dock you trusted, in Probe Dock you trust and in Probe Dock you\'ll trust', points: 1000000, picture: 'still no url yet'},
          {name: 'Glenford J. Myers Guru', description: 'Because in Probe Dock you trust', points: 100000000, picture: 'still no url yet...'}
        ];
        var credentials = '';
        var id = -1;
        createApplication(app, credentials)
                .then(function(createdApplication) {
                	credentials = createdApplication.credentials;
                	return createOrganization(org, credentials);
  							})
                .then(function(createdOrganization) {
                  credentials = createdOrganization.credentials;
                  return createPointScale(pts, credentials);
                })
                .then(function(createdPointScale) {
                  var location = createdPointScale.url;
  								id = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(id, lvl[0], credentials);
                })
                .then(function(createdLevel) {
                  return createLevel(id, lvl[1], credentials);
                })
                .then(function(createdLevel) {
                  return createLevel(id, lvl[2], credentials);
                })
                .then(function(createdLevel) {
                  return api
                          .get('/pointScales/' + id + '/levels?sort=points')
                          .set('Accept', 'application/json')
                          .set('Authorization', credentials)
                          .expect(200);
                })
                .then(function(response) {
                  var levels = response.body.map(function(l) {
                    return {name: l.name, description: l.description, points: l.points, picture: l.picture};
                  });
                  expect(levels).to.eql(lvl);
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
      });

      it('should be possible to limit items', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
        var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = [
          {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'},
          {name: 'Certified Probe Dock User', description: 'Because in Probe Dock you trusted, in Probe Dock you trust and in Probe Dock you\'ll trust', points: 1000000, picture: 'still no url yet'},
          {name: 'Glenford J. Myers Guru', description: 'Because in Probe Dock you trust', points: 100000000, picture: 'still no url yet...'}
        ];
        var credentials = '';
        var id = -1;
        var limit = '1';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                	credentials = createdApplication.credentials;
                	return createOrganization(org, credentials);
  							})
                .then(function(createdOrganization) {
                  credentials = createdOrganization.credentials;
                  return createPointScale(pts, credentials);
                })
                .then(function(createdPointScale) {
                  var location = createdPointScale.url;
  								id = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(id, lvl[0], credentials);
                })
                .then(function(createdLevel) {
                  return createLevel(id, lvl[1], credentials);
                })
                .then(function(createdLevel) {
                  return createLevel(id, lvl[2], credentials);
                })
                .then(function(createdLevel) {
                  return api
                          .get('/pointScales/' + id + '/levels?size=' + limit)
                          .set('Accept', 'application/json')
                          .set('Authorization', credentials)
                          .expect(200);
                })
                .then(function(response) {
                  var headers = response.headers;
                  var levels = response.body;
                  expect(levels).to.have.lengthOf(limit);
                  expect(headers['x-pagination-page-size']).to.equal(limit);
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
      });

      it('should be possible to select an item page', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
        var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = [
          {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'},
          {name: 'Certified Probe Dock User', description: 'Because in Probe Dock you trusted, in Probe Dock you trust and in Probe Dock you\'ll trust', points: 1000000, picture: 'still no url yet'},
          {name: 'Glenford J. Myers Guru', description: 'Because in Probe Dock you trust', points: 100000000, picture: 'still no url yet...'}
        ];
        var credentials = '';
        var id = -1;
        var page = '1';
        var limit = '1';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                	credentials = createdApplication.credentials;
                	return createOrganization(org, credentials);
  							})
                .then(function(createdOrganization) {
                  credentials = createdOrganization.credentials;
                  return createPointScale(pts, credentials);
                })
                .then(function(createdPointScale) {
                  var location = createdPointScale.url;
  								id = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(id, lvl[0], credentials);
                })
                .then(function(createdLevel) {
                  return createLevel(id, lvl[1], credentials);
                })
                .then(function(createdLevel) {
                  return createLevel(id, lvl[2], credentials);
                })
                .then(function(createdLevel) {
                  return api
                          .get('/pointScales/' + id + '/levels?size=' + limit + '&page=' + page)
                          .set('Accept', 'application/json')
                          .set('Authorization', credentials)
                          .expect(200);
                })
                .then(function(response) {
                  var headers = response.headers;
                  var levels = response.body;
                  expect(levels).to.have.lengthOf(limit);
                  expect(headers['x-pagination-page']).to.equal(page);
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
      });

  	});

	});

	describe('POST levels', function() {

    describe('Authorization', function() {

      it('should be refused in case of missing credentials', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'};
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var location = createdPointScale.url;
  								var pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return api
            				.post('/pointScales' + '/' + pointScaleId + '/levels')
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .send(lvl)
            				.expect(401);
                })
                .then(function(response) {
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should be refused in case of wrong credentials', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'};
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var credentials = new Buffer('<none>').toString('base64');
                  var location = createdPointScale.url;
  								var pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return api
            				.post('/pointScales' + '/' + pointScaleId + '/levels')
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .set('Authorization', credentials)
                    .send(lvl)
            				.expect(401);
                })
                .then(function(response) {
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

    });

    describe('Specification', function() {

      it('should return a 201 HTTP status code when a level has been created', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'};
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var authorization = new Buffer('<none>').toString('base64');
                  var location = createdPointScale.url;
  								var pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(pointScaleId, lvl, createdPointScale.credentials);
                })
                .then(function(response) {
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should return the created level as the response payload', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'};
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var authorization = new Buffer('<none>').toString('base64');
                  var location = createdPointScale.url;
  								var pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(pointScaleId, lvl, createdPointScale.credentials);
                })
                .then(function(createdLevel) {
                  var level = createdLevel.payload;
  								expect(level).to.not.be.empty;
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should return an HTTP Location header when a level has been created', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'};
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var authorization = new Buffer('<none>').toString('base64');
                  var location = createdPointScale.url;
  								var pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(pointScaleId, lvl, createdPointScale.credentials);
                })
                .then(function(createdLevel) {
                  var location = createdLevel.url;
  								expect(location).to.not.be.undefined;
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should return an HTTP Location header matching the created level URI', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'};
        var pointScaleId = -1;
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var authorization = new Buffer('<none>').toString('base64');
                  var location = createdPointScale.url;
  								pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(pointScaleId, lvl, createdPointScale.credentials);
                })
                .then(function(createdLevel) {
                  var location = createdLevel.url;
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
  								var uri = apiPrefix + '/pointScales' + '/' + pointScaleId + '/levels' + '/' + id;
  								expect(location).to.equal(uri);
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

    });

    describe('Validation', function() {

      it('should return a 422 HTTP status code when submitting an invalid payload', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {};
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var credentials = createdPointScale.credentials;
                  var location = createdPointScale.url;
  								var pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return api
            				.post('/pointScales' + '/' + pointScaleId + '/levels')
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .set('Authorization', credentials)
                    .send(lvl)
            				.expect(422);
                })
                .then(function(response) {
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should be refused when the expected properties are missing in the request body', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {};
        var credentials = '';
        var errors = [
        	{reason: 'NotNull', locationType: 'json', location: 'name', message: 'This value is required.'},
  				{reason: 'NotNull', locationType: 'json', location: 'description', message: 'This value is required.'},
          {reason: 'NotNull', locationType: 'json', location: 'points', message: 'This value is required.'},
          {reason: 'NotNull', locationType: 'json', location: 'picture', message: 'This value is required.'}
        ];
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var credentials = createdPointScale.credentials;
                  var location = createdPointScale.url;
  								var pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return api
            				.post('/pointScales' + '/' + pointScaleId + '/levels')
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .set('Authorization', credentials)
                    .send(lvl)
            				.expect(422);
                })
                .then(function(response) {
                  var e = response.body;
  								expect(e).to.have.lengthOf(errors.length);
  								expect(e).to.deep.include.members(errors);
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should be refused when properties values are too long', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'a'.repeat(26), description: 'a'.repeat(101), points: 0, picture: 'a'.repeat(256)};
        var credentials = '';
        var errors = [
        	{reason: 'Size', locationType: 'json', location: 'name', message: 'This value is too long (the maximum is 25 while the actual length is 26).'},
  				{reason: 'Size', locationType: 'json', location: 'description', message: 'This value is too long (the maximum is 100 while the actual length is 101).'},
          {reason: 'Size', locationType: 'json', location: 'picture', message: 'This value is too long (the maximum is 255 while the actual length is 256).'}
        ];
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var credentials = createdPointScale.credentials;
                  var location = createdPointScale.url;
  								var pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return api
            				.post('/pointScales' + '/' + pointScaleId + '/levels')
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .set('Authorization', credentials)
                    .send(lvl)
            				.expect(422);
                })
                .then(function(response) {
                  var e = response.body;
  								expect(e).to.have.lengthOf(errors.length);
  								expect(e).to.deep.include.members(errors);
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should be refused when properties values are in the wrong format', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: '<NaN>', picture: 'no url yet'};
        var credentials = '';
        var errors = [
        	{reason: 'Pattern', locationType: 'json', location: 'points', message: 'This value is of the wrong format.'}
        ];
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var credentials = createdPointScale.credentials;
                  var location = createdPointScale.url;
  								var pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return api
            				.post('/pointScales' + '/' + pointScaleId + '/levels')
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .set('Authorization', credentials)
                    .send(lvl)
            				.expect(422);
                })
                .then(function(response) {
                  var e = response.body;
  								expect(e).to.have.lengthOf(errors.length);
  								expect(e).to.deep.include.members(errors);
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

    });

	});

	describe('GET level', function() {

    describe('Authorization', function() {

      it('should be refused in case of missing credentials', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'};
        var pointScaleId = -1;
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var authorization = new Buffer('<none>').toString('base64');
                  var location = createdPointScale.url;
  								pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(pointScaleId, lvl, createdPointScale.credentials);
                })
                .then(function(createdLevel) {
                  var location = createdLevel.url;
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
                  return api
  												.get('/pointScales' + '/' + pointScaleId + '/levels' + '/' + id)
  												.set('Accept', 'application/json')
  												.expect(401);
                })
                .then(function(response) {
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should be refused in case of wrong credentials', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'};
        var pointScaleId = -1;
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var authorization = new Buffer('<none>').toString('base64');
                  var location = createdPointScale.url;
  								pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(pointScaleId, lvl, createdPointScale.credentials);
                })
                .then(function(createdLevel) {
                  var location = createdLevel.url;
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
                  var credentials = new Buffer('<none>').toString('base64');
                  return api
  												.get('/pointScales' + '/' + pointScaleId + '/levels' + '/' + id)
  												.set('Accept', 'application/json')
                          .set('Authorization', credentials)
  												.expect(401);
                })
                .then(function(response) {
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

    });

    describe('Specification', function() {

      it('should be able to GET a level after having POSTed it from HTTP Location header', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'};
        var pointScaleId = -1;
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var authorization = new Buffer('<none>').toString('base64');
                  var location = createdPointScale.url;
  								pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(pointScaleId, lvl, createdPointScale.credentials);
                })
                .then(function(createdLevel) {
                  var location = createdLevel.url;
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
                  return getLevel(pointScaleId, id, createdLevel.credentials);
                })
                .then(function(response) {
                  var level = response.body;
  								expect(level).to.not.be.empty;
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should return a level with expected properties and expected values', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'};
        var id = -1;
        var pointScaleId = -1;
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var authorization = new Buffer('<none>').toString('base64');
                  var location = createdPointScale.url;
  								pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(pointScaleId, lvl, createdPointScale.credentials);
                })
                .then(function(createdLevel) {
                  var location = createdLevel.url;
  								id = location.match(/\/([^\/]+)\/?$/)[1];
                  return getLevel(pointScaleId, id, createdLevel.credentials);
                })
                .then(function(response) {
                  var level = response.body;
                  expect(level.name).to.equal(lvl.name);
  								expect(level.description).to.equal(lvl.description);
                  expect(level.points).to.equal(lvl.points);
                  expect(level.picture).to.equal(lvl.picture);
  								expect(level.createdAt).to.equal(level.updatedAt);
  								expect(level.href).to.equal(apiPrefix + '/pointScales' + '/' + pointScaleId + '/levels' + '/' + id);
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should return a 404 HTTP status code in case of non existing level with a given id', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'};
        var credentials = '';
        var id = -1;
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  credentials = createdOrganization.credentials;
                	return createPointScale(pts, credentials);
                })
                .then(function(createdPointScale) {
                  var location = createdPointScale.url;
  								pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(pointScaleId, lvl, credentials);
                })
                .then(function(createdLevel) {
                  var location = createdLevel.url;
  								id = location.match(/\/([^\/]+)\/?$/)[1];
                  return removeLevel(pointScaleId, id, credentials);
                })
                .then(function(response) {
                  return api
  												.get('/pointScales/' + pointScaleId + '/levels/' + id)
  												.set('Accept', 'application/json')
  												.set('Authorization', credentials)
  												.expect(404);
                })
                .then(function(response) {
  								done();
  							})
                .catch(function(err) {
                  done.fail(err);
                });
  		});

    });

	});

	describe('PUT level', function() {

    describe('Authorization', function() {

      it('should be refused in case of missing credentials', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'};
        var pointScaleId = -1;
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var authorization = new Buffer('<none>').toString('base64');
                  var location = createdPointScale.url;
  								pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(pointScaleId, lvl, createdPointScale.credentials);
                })
                .then(function(createdLevel) {
                  var location = createdLevel.url;
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
                  var lvl = {name: 'Certified Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'still no url yet'};
                  return api
  												.put('/pointScales' + '/' + pointScaleId + '/' + 'levels' + '/' + id)
  												.set('Content-Type', 'application/json')
  												.set('Accept', 'application/json')
  												.send(lvl)
  												.expect(401);
                })
                .then(function(response) {
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should be refused in case of wrong credentials', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'};
        var pointScaleId = -1;
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var authorization = new Buffer('<none>').toString('base64');
                  var location = createdPointScale.url;
  								pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(pointScaleId, lvl, createdPointScale.credentials);
                })
                .then(function(createdLevel) {
                  var location = createdLevel.url;
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
                  var lvl = {name: 'Certified Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'still no url yet'};
                  var credentials = new Buffer('<none>').toString('base64');
                  return api
  												.put('/pointScales' + '/' + pointScaleId + '/' + 'levels' + '/' + id)
  												.set('Content-Type', 'application/json')
  												.set('Accept', 'application/json')
                          .set('Authorization', credentials)
  												.send(lvl)
  												.expect(401);
                })
                .then(function(response) {
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

    });

    describe('Specification', function() {

      it('should return a 200 HTTP status code in case of successful PUT processing', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'};
        var pointScaleId = -1;
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var authorization = new Buffer('<none>').toString('base64');
                  var location = createdPointScale.url;
  								pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(pointScaleId, lvl, createdPointScale.credentials);
                })
                .then(function(createdLevel) {
                  var location = createdLevel.url;
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
                  var lvl = {name: 'Certified Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'still no url yet'};
                  return updateLevel(pointScaleId, id, lvl, createdLevel.credentials);
                })
                .then(function(response) {
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should return the updated level as the response payload', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'};
        var pointScaleId = -1;
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var authorization = new Buffer('<none>').toString('base64');
                  var location = createdPointScale.url;
  								pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(pointScaleId, lvl, createdPointScale.credentials);
                })
                .then(function(createdLevel) {
                  var location = createdLevel.url;
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
                  var lvl = {name: 'Certified Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'still no url yet'};
                  return updateLevel(pointScaleId, id, lvl, createdLevel.credentials);
                })
                .then(function(updatedLevel) {
                  var level = updatedLevel.payload;
  								expect(level).to.not.be.empty;
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should update the expected properties of the level', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'};
        var pointScaleId = -1;
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var authorization = new Buffer('<none>').toString('base64');
                  var location = createdPointScale.url;
  								pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(pointScaleId, lvl, createdPointScale.credentials);
                })
                .then(function(createdLevel) {
                  var location = createdLevel.url;
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
                  lvl = {name: 'Certified Probe Dock User', description: 'Because in Probe Dock you trust', points: 1, picture: 'still no url yet'};
                  return updateLevel(pointScaleId, id, lvl, createdLevel.credentials);
                })
                .then(function(updatedLevel) {
                  var level = updatedLevel.payload;
                  expect(level.name).to.equal(lvl.name);
  								expect(level.description).to.equal(lvl.description);
                  expect(level.points).to.equal(lvl.points);
                  expect(level.description).to.equal(lvl.description);
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should automatically update the :updatedAt property of the level', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'};
        var pointScaleId = -1;
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var authorization = new Buffer('<none>').toString('base64');
                  var location = createdPointScale.url;
  								pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(pointScaleId, lvl, createdPointScale.credentials);
                })
                .then(function(createdLevel) {
                  var location = createdLevel.url;
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
                  var lvl = {name: 'Certified Probe Dock User', description: 'Because in Probe Dock you trust', points: 1, picture: 'still no url yet'};
                  return updateLevel(pointScaleId, id, lvl, createdLevel.credentials);
                })
                .then(function(updatedLevel) {
                  var level = updatedLevel.payload;
                  expect(level.updatedAt).to.above(level.createdAt);
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should return a 404 HTTP status code in case of non existing level with a given id', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'};
        var credentials = '';
        var id = -1;
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  credentials = createdOrganization.credentials;
                	return createPointScale(pts, credentials);
                })
                .then(function(createdPointScale) {
                  var location = createdPointScale.url;
  								pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(pointScaleId, lvl, credentials);
                })
                .then(function(createdLevel) {
                  var location = createdLevel.url;
  								id = location.match(/\/([^\/]+)\/?$/)[1];
                  return removeLevel(pointScaleId, id, credentials);
                })
                .then(function(response) {
                  var lvl = {name: 'Certified Probe Dock User', description: 'Because in Probe Dock you trust', points: 1, picture: 'still no url yet'};
                  return api
  												.get('/pointScales/' + pointScaleId + '/levels/' + id)
                          .set('Content-Type', 'application/json')
                          .set('Accept', 'application/json')
                          .set('Authorization', credentials)
                          .send(lvl)
                          .expect(404);
                })
                .then(function(response) {
  								done();
  							})
                .catch(function(err) {
                  done.fail(err);
                });
  		});

    });

    describe('Validation', function() {

      it('should return a 422 HTTP status code when submitting an invalid payload', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'};
        var pointScaleId = -1;
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var credentials = createdPointScale.credentials;
                  var location = createdPointScale.url;
  								pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(pointScaleId, lvl, credentials);
                })
                .then(function(createdLevel) {
                  var credentials = createdLevel.credentials;
                  var location = createdLevel.url;
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
                  var lvl = {};
                  return api
            				.put('/pointScales' + '/' + pointScaleId + '/levels' + '/' + id)
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .set('Authorization', credentials)
                    .send(lvl)
            				.expect(422);
                })
                .then(function(response) {
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should be refused when the expected properties are missing in the request body', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'};
        var pointScaleId = -1;
        var credentials = '';
        var errors = [
        	{reason: 'NotNull', locationType: 'json', location: 'name', message: 'This value is required.'},
  				{reason: 'NotNull', locationType: 'json', location: 'description', message: 'This value is required.'},
          {reason: 'NotNull', locationType: 'json', location: 'points', message: 'This value is required.'},
          {reason: 'NotNull', locationType: 'json', location: 'picture', message: 'This value is required.'}
        ];
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var credentials = createdPointScale.credentials;
                  var location = createdPointScale.url;
  								pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(pointScaleId, lvl, credentials);
                })
                .then(function(createdLevel) {
                  var credentials = createdLevel.credentials;
                  var location = createdLevel.url;
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
                  var lvl = {};
                  return api
            				.put('/pointScales' + '/' + pointScaleId + '/levels' + '/' + id)
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .set('Authorization', credentials)
                    .send(lvl)
            				.expect(422);
                })
                .then(function(response) {
                  var e = response.body;
  								expect(e).to.have.lengthOf(errors.length);
  								expect(e).to.deep.include.members(errors);
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should be refused when expected properties values are too long', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'};
        var pointScaleId = -1;
        var credentials = '';
        var errors = [
        	{reason: 'Size', locationType: 'json', location: 'name', message: 'This value is too long (the maximum is 25 while the actual length is 26).'},
  				{reason: 'Size', locationType: 'json', location: 'description', message: 'This value is too long (the maximum is 100 while the actual length is 101).'},
          {reason: 'Size', locationType: 'json', location: 'picture', message: 'This value is too long (the maximum is 255 while the actual length is 256).'}
        ];
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var credentials = createdPointScale.credentials;
                  var location = createdPointScale.url;
  								pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(pointScaleId, lvl, credentials);
                })
                .then(function(createdLevel) {
                  var credentials = createdLevel.credentials;
                  var location = createdLevel.url;
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
                  var lvl = {name: 'a'.repeat(26), description: 'a'.repeat(101), points: 0, picture: 'a'.repeat(256)};
                  return api
            				.put('/pointScales' + '/' + pointScaleId + '/levels' + '/' + id)
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .set('Authorization', credentials)
                    .send(lvl)
            				.expect(422);
                })
                .then(function(response) {
                  var e = response.body;
  								expect(e).to.have.lengthOf(errors.length);
  								expect(e).to.deep.include.members(errors);
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should be refused when properties values are in the wrong format', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'};
        var pointScaleId = -1;
        var credentials = '';
        var errors = [
        	{reason: 'Pattern', locationType: 'json', location: 'points', message: 'This value is of the wrong format.'}
        ];
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var credentials = createdPointScale.credentials;
                  var location = createdPointScale.url;
  								pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(pointScaleId, lvl, credentials);
                })
                .then(function(createdLevel) {
                  var credentials = createdLevel.credentials;
                  var location = createdLevel.url;
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
                  var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: '<NaN>', picture: 'no url yet'};
                  return api
            				.put('/pointScales' + '/' + pointScaleId + '/levels' + '/' + id)
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .set('Authorization', credentials)
                    .send(lvl)
            				.expect(422);
                })
                .then(function(response) {
                  var e = response.body;
  								expect(e).to.have.lengthOf(errors.length);
  								expect(e).to.deep.include.members(errors);
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

    });

	});

	describe('DELETE level', function() {

    describe('Authorization', function() {

      it('should be refused in case of missing credentials', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'};
        var pointScaleId = -1;
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var authorization = new Buffer('<none>').toString('base64');
                  var location = createdPointScale.url;
  								pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(pointScaleId, lvl, createdPointScale.credentials);
                })
                .then(function(createdLevel) {
                  var location = createdLevel.url;
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
                  return api
  												.delete('/pointScales' + '/' + pointScaleId + '/' + 'levels' + '/' + id)
  												.expect(401);
                })
                .then(function(response) {
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should be refused in case of wrong credentials', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'};
        var pointScaleId = -1;
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var authorization = new Buffer('<none>').toString('base64');
                  var location = createdPointScale.url;
  								pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(pointScaleId, lvl, createdPointScale.credentials);
                })
                .then(function(createdLevel) {
                  var location = createdLevel.url;
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
                  var credentials = new Buffer('<none>').toString('base64');
                  return api
  												.delete('/pointScales' + '/' + pointScaleId + '/' + 'levels' + '/' + id)
                          .set('Authorization', credentials)
  												.expect(401);
                })
                .then(function(response) {
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

    });

    describe('Specification', function() {

      it('should return a 204 HTTP status code in case of successful DELETE processing', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'};
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  credentials = createdOrganization.credentials;
                	return createPointScale(pts, credentials);
                })
                .then(function(createdPointScale) {
                  var location = createdPointScale.url;
  								pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(pointScaleId, lvl, credentials);
                })
                .then(function(createdLevel) {
                  var location = createdLevel.url;
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
                  return removeLevel(pointScaleId, id, credentials);
                })
                .then(function(response) {
  								done();
  							})
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should return a 404 HTTP status code in case of non existing level with a given id', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'};
        var credentials = '';
        var id = -1;
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  credentials = createdOrganization.credentials;
                	return createPointScale(pts, credentials);
                })
                .then(function(createdPointScale) {
                  var location = createdPointScale.url;
  								pointScaleId = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(pointScaleId, lvl, credentials);
                })
                .then(function(createdLevel) {
                  var location = createdLevel.url;
  								id = location.match(/\/([^\/]+)\/?$/)[1];
                  return removeLevel(pointScaleId, id, credentials);
                })
                .then(function(response) {
                  return api
  												.delete('/pointScales/' + pointScaleId + '/levels/' + id)
  												.set('Authorization', credentials)
  												.expect(404);
                })
                .then(function(response) {
  								done();
  							})
                .catch(function(err) {
                  done.fail(err);
                });
  		});

    });

	});

});
