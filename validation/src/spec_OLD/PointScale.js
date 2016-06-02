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

function getPointScales(authorization) {
  return get('/pointScales/', authorization);
}

function getPointScale(pointScaleId, authorization) {
  return get('/pointScales/' + pointScaleId, authorization);
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

function updatePointScale(pointScaleId, payload, authorization) {
  return update('/pointScales/' + pointScaleId, payload, authorization)
          .then(function(updatedPointScale) {
            var credentials = authorization;
            return {
              url: updatedPointScale.url,
              payload: updatedPointScale.payload,
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

function removePointScale(pointScaleId, authorization) {
  return remove('/pointScales/' + pointScaleId, authorization);
}

function removeLevel(pointScaleId, levelId, authorization) {
  return remove('/pointScales/' + pointScaleId + '/levels/' + levelId, authorization);
}

describe('PointScales REST endpoint', function() {

  describe('GET pointScales', function() {

    describe('Authorization', function() {

      it('should be refused in case of missing credentials', function(done) {
        api
  				.get('/pointScales')
  				.set('Accept', 'application/json')
  				.expect(401)
  				.then(function(response) {
  					done();
  				})
  				.catch(function(err) {
            done.fail(err);
          });
  		});

      it('should be refused in case of wrong credentials', function(done) {
        var authorization = new Buffer('<none>').toString('base64');
  			api
  				.get('/pointScales')
  				.set('Accept', 'application/json')
  				.set('Authorization', authorization)
  				.expect(401)
  				.then(function(response) {
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
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return getPointScales(createdOrganization.credentials);
                })
                .then(function(response) {
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should return an array', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                	return getPointScales(createdOrganization.credentials);
                })
                .then(function(response) {
                	var pointScales = response.body;
  								expect(pointScales).to.be.an('array');
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
      });

      it('should return an empty array when no point scale exists', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return getPointScales(createdOrganization.credentials);
                })
                .then(function(response) {
                	var pointScales = response.body;
  								expect(pointScales).to.be.empty;
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should not return an empty array when point scales do exist', function(done) {
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
                  return getPointScales(createdPointScale.credentials);
                })
                .then(function(response) {
                	var pointScales = response.body;
  								expect(pointScales).to.not.be.empty;
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should return a one-sized array when only one point scale does exist', function(done) {
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
                  return getPointScales(createdPointScale.credentials);
                })
                .then(function(response) {
                	var pointScales = response.body;
  								expect(pointScales).to.have.lengthOf(1);
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
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                	return getPointScales(createdOrganization.credentials);
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
        var pts = [
          {name: 'First-Test', description: 'Because you run your first test.'},
          {name: 'Hundredth-Test', description: 'Because you run your hundredth test.'},
          {name: 'Thousandth-Test', description: 'Because you run your thousandth test.'}
        ];
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                	credentials = createdApplication.credentials;
                	return createOrganization(org, credentials);
  							})
                .then(function(createdOrganization) {
                  credentials = createdOrganization.credentials;
                  return createPointScale(pts[0], credentials);
                })
                .then(function(createdPointScale) {
                  return createPointScale(pts[1], credentials);
                })
                .then(function(createdPointScale) {
                  return createPointScale(pts[2], credentials);
                })
                .then(function(createdPointScale) {
                  return api
                          .get('/pointScales?sort=name')
                          .set('Accept', 'application/json')
                          .set('Authorization', credentials)
                          .expect(200);
                })
                .then(function(response) {
                  var pointScales = response.body.map(function(p) {
                    return {name: p.name, description: p.description};
                  });
                  expect(pointScales).to.eql(pts);
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
      });

      it('should be possible to limit items', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
        var pts = [
          {name: 'First-Test', description: 'Because you run your first test.'},
          {name: 'Hundredth-Test', description: 'Because you run your hundredth test.'},
          {name: 'Thousandth-Test', description: 'Because you run your thousandth test.'}
        ];
        var credentials = '';
        var limit = '1';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                	credentials = createdApplication.credentials;
                	return createOrganization(org, credentials);
  							})
                .then(function(createdOrganization) {
                  credentials = createdOrganization.credentials;
                  return createPointScale(pts[0], credentials);
                })
                .then(function(createdPointScale) {
                  return createPointScale(pts[1], credentials);
                })
                .then(function(createdPointScale) {
                  return createPointScale(pts[2], credentials);
                })
                .then(function(createdPointScale) {
                  return api
                          .get('/pointScales?size=' + limit)
                          .set('Accept', 'application/json')
                          .set('Authorization', credentials)
                          .expect(200);
                })
                .then(function(response) {
                  var headers = response.headers;
                  var pointScales = response.body;
                  expect(pointScales).to.have.lengthOf(limit);
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
        var pts = [
          {name: 'First-Test', description: 'Because you run your first test.'},
          {name: 'Hundredth-Test', description: 'Because you run your hundredth test.'},
          {name: 'Thousandth-Test', description: 'Because you run your thousandth test.'}
        ];
        var credentials = '';
        var page = '1';
        var limit = '1';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                	credentials = createdApplication.credentials;
                	return createOrganization(org, credentials);
  							})
                .then(function(createdOrganization) {
                  credentials = createdOrganization.credentials;
                  return createPointScale(pts[0], credentials);
                })
                .then(function(createdPointScale) {
                  return createPointScale(pts[1], credentials);
                })
                .then(function(createdPointScale) {
                  return createPointScale(pts[2], credentials);
                })
                .then(function(createdPointScale) {
                  return api
                          .get('/pointScales?size=' + limit + '&page=' + page)
                          .set('Accept', 'application/json')
                          .set('Authorization', credentials)
                          .expect(200);
                })
                .then(function(response) {
                  var headers = response.headers;
                  var pointScales = response.body;
                  expect(pointScales).to.have.lengthOf(limit);
                  expect(headers['x-pagination-page']).to.equal(page);
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
      });

  	});

	});

	describe('POST pointScales', function() {

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
                  return api
  												.post('/pointScales')
  												.set('Content-Type', 'application/json')
  												.set('Accept', 'application/json')
  												.send(pts)
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
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                	var credentials = new Buffer('<none>').toString('base64');
                  return api
  												.post('/pointScales')
  												.set('Content-Type', 'application/json')
  												.set('Accept', 'application/json')
  												.set('Authorization', credentials)
  												.send(pts)
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

      it('should return a 201 HTTP status code when a point scale has been created', function(done) {
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
                .then(function() {
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should return the created point scale as the response payload', function(done) {
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
                	var pointScale = createdPointScale.payload;
  								expect(pointScale).to.not.be.empty;
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should return the created point scale without any level', function(done) {
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
                	var pointScale = createdPointScale.payload;
                  var levels = pointScale.levels;
  								expect(levels).to.be.empty;
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should return an HTTP Location header when a point scale has been created', function(done) {
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
  								expect(location).to.not.be.undefined;
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should return an HTTP Location header matching the created point scale URI', function(done) {
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
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
  								var uri = apiPrefix + '/pointScales' + '/' + id;
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
  			var pts = {};
        var credentials = '';
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                	credentials = createdOrganization.credentials;
                  return api
  												.post('/pointScales')
  												.set('Content-Type', 'application/json')
  												.set('Accept', 'application/json')
  												.set('Authorization', credentials)
  												.send(pts)
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
  			var pts = {};
        var credentials = '';
        var errors = [
        	{reason: 'NotNull', locationType: 'json', location: 'name', message: 'This value is required.'},
  				{reason: 'NotNull', locationType: 'json', location: 'description', message: 'This value is required.'}
        ];
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                	credentials = createdOrganization.credentials;
                  return api
  												.post('/pointScales')
  												.set('Content-Type', 'application/json')
  												.set('Accept', 'application/json')
  												.set('Authorization', credentials)
  												.send(pts)
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
  			var pts = {name: 'a'.repeat(26), description: 'a'.repeat(101)};
        var credentials = '';
        var errors = [
        	{reason: 'Size', locationType: 'json', location: 'name', message: 'This value is too long (the maximum is 25 while the actual length is 26).'},
  				{reason: 'Size', locationType: 'json', location: 'description', message: 'This value is too long (the maximum is 100 while the actual length is 101).'}
        ];
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                	credentials = createdOrganization.credentials;
                  return api
  												.post('/pointScales')
  												.set('Content-Type', 'application/json')
  												.set('Accept', 'application/json')
  												.set('Authorization', credentials)
  												.send(pts)
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


	describe('GET pointScale', function() {

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
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
                  return api
  												.get('/pointScales' + '/' + id)
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
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
  								var credentials = new Buffer('<none>').toString('base64');
                  return api
  												.get('/pointScales' + '/' + id)
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

      it('should be able to GET a point scale after having POSTed it from HTTP Location header', function(done) {
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
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
                  return getPointScale(id, createdPointScale.credentials);
                })
                .then(function(response) {
                	var pointScale = response.body;
  								expect(pointScale).to.not.be.empty;
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should return a point scale with expected properties and expected values', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var credentials = '';
        var id = -1;
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                	var location = createdPointScale.url;
  								id = location.match(/\/([^\/]+)\/?$/)[1];
                  return getPointScale(id, createdPointScale.credentials);
                })
                .then(function(response) {
                	var pointScale = response.body;
  								expect(pointScale.name).to.equal(pts.name);
  								expect(pointScale.description).to.equal(pts.description);
  								expect(pointScale.createdAt).to.equal(pointScale.updatedAt);
  								expect(pointScale.href).to.equal(apiPrefix + '/pointScales' + '/' + id);
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should return a point scale with expected levels after having POSTed one', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'};
        var credentials = '';
        var id = -1;
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  credentials = createdApplication.credentials;
                  return createOrganization(org, credentials);
                })
                .then(function(createdOrganization) {
                  credentials = createdOrganization.credentials;
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var location = createdPointScale.url;
  								id = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(id, lvl, credentials);
                })
                .then(function(createdLevel) {
                  return getPointScale(id, credentials);
                })
                .then(function(response) {
  								var pointScale = response.body;
                  var levels = pointScale.levels;
                  expect(levels).to.have.lengthOf(1);
                  expect(levels[0].name).to.equal(lvl.name);
  								done();
  							})
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should return a point scale with expected levels after having DELETed one', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'};
        var credentials = '';
        var ptsId = -1;
        var lvlId = -1;
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
  								ptsId = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(ptsId, lvl, credentials);
                })
                .then(function(createdLevel) {
                  var location = createdLevel.url;
  								lvlId = location.match(/\/([^\/]+)\/?$/)[1];
                  return removeLevel(ptsId, lvlId, credentials);
                })
                .then(function(response) {
                  return getPointScale(ptsId, credentials);
                })
                .then(function(response) {
                  var pointScale = response.body;
                  var levels = pointScale.levels;
                  expect(levels).to.be.empty;
  								done();
  							})
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should return a 404 HTTP status code in case of non existing point scale with a given id', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
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
  								id = location.match(/\/([^\/]+)\/?$/)[1];
                  return removePointScale(id, credentials);
                })
                .then(function(response) {
                  return api
  												.get('/pointScales' + '/' + id)
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

	describe('PUT pointScale', function() {

    describe('Authorization', function() {

      it('should be refused in case of missing credentials', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Teste', description: 'Because you runned your first test.'};
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
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
  								var pts = {name: 'First Test', description: 'Because you run your first test.'};
                  return api
  												.put('/pointScales' + '/' + id)
  												.set('Content-Type', 'application/json')
  												.set('Accept', 'application/json')
  												.send(pts)
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
  			var pts = {name: 'First Teste', description: 'Because you runned your first test.'};
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
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
  								var pts = {name: 'First Test', description: 'Because you run your first test.'};
  								var credentials = new Buffer('<none>').toString('base64');
                  return api
  												.put('/pointScales' + '/' + id)
  												.set('Content-Type', 'application/json')
  												.set('Accept', 'application/json')
  												.set('Authorization', credentials)
  												.send(pts)
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
  			var pts = {name: 'First Teste', description: 'Because you runned your first test.'};
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
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
  								var pts = {name: 'First Test', description: 'Because you run your first test.'};
                  return updatePointScale(id, pts, createdPointScale.credentials);
                })
                .then(function(response) {
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should return the updated point scale as the response payload', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Teste', description: 'Because you runned your first test.'};
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
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
  								var pts = {name: 'First Test', description: 'Because you run your first test.'};
                  return updatePointScale(id, pts, createdPointScale.credentials);
                })
                .then(function(updatedPointScale) {
                	var pointScale = updatedPointScale.payload;
  								expect(pointScale).to.not.be.empty;
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should update the expected properties of the point scale', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Teste', description: 'Because you runned your first test.'};
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
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
  								pts = {name: 'First Test', description: 'Because you run your first test.'};
                  return updatePointScale(id, pts, createdPointScale.credentials);
                })
                .then(function(updatedPointScale) {
                	var pointScale = updatedPointScale.payload;
  								expect(pointScale.name).to.equal(pts.name);
  								expect(pointScale.description).to.equal(pts.description);
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should automatically update the :updatedAt property of the point scale', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Teste', description: 'Because you runned your first test.'};
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
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
  								var pts = {name: 'First Test', description: 'Because you run your first test.'};
                  return updatePointScale(id, pts, createdPointScale.credentials);
                })
                .then(function(updatedPointScale) {
                	var pointScale = updatedPointScale.payload;
                	expect(pointScale.updatedAt).to.above(pointScale.createdAt);
                  done();
                })
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should return a 404 HTTP status code in case of non existing point scale with a given id', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Teste', description: 'Because you runned your first test.'};
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
  								id = location.match(/\/([^\/]+)\/?$/)[1];
                  return removePointScale(id, credentials);
                })
                .then(function(response) {
                  var pts = {name: 'First Test', description: 'Because you run your first test.'};
                  return api
                          .put('/pointScales' + '/' + id)
                          .set('Content-Type', 'application/json')
                          .set('Accept', 'application/json')
                          .set('Authorization', credentials)
                          .send(pts)
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
  			var pts = {name: 'First Teste', description: 'Because you runned your first test.'};
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
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
  								var pts = {}
                  return api
  												.put('/pointScales' + '/' + id)
  												.set('Content-Type', 'application/json')
  												.set('Accept', 'application/json')
  												.set('Authorization', createdPointScale.credentials)
  												.send(pts)
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
  			var pts = {name: 'First Teste', description: 'Because you runned your first test.'};
        var credentials = '';
        var errors = [
        	{reason: 'NotNull', locationType: 'json', location: 'name', message: 'This value is required.'},
  				{reason: 'NotNull', locationType: 'json', location: 'description', message: 'This value is required.'}
        ];
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                	var location = createdPointScale.url;
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
  								var pts = {}
                  return api
  												.put('/pointScales' + '/' + id)
  												.set('Content-Type', 'application/json')
  												.set('Accept', 'application/json')
  												.set('Authorization', createdPointScale.credentials)
  												.send(pts)
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
  			var pts = {name: 'First Teste', description: 'Because you runned your first test.'};
        var credentials = '';
        var errors = [
        	{reason: 'Size', locationType: 'json', location: 'name', message: 'This value is too long (the maximum is 25 while the actual length is 26).'},
  				{reason: 'Size', locationType: 'json', location: 'description', message: 'This value is too long (the maximum is 100 while the actual length is 101).'}
        ];
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  return createOrganization(org, createdApplication.credentials);
                })
                .then(function(createdOrganization) {
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                	var location = createdPointScale.url;
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
  								var pts = {name: 'a'.repeat(26), description: 'a'.repeat(101)};
                  return api
  												.put('/pointScales' + '/' + id)
  												.set('Content-Type', 'application/json')
  												.set('Accept', 'application/json')
  												.set('Authorization', createdPointScale.credentials)
  												.send(pts)
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

	describe('DELETE pointScale', function() {

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
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
                  return api
  												.delete('/pointScales' + '/' + id)
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
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
  								var credentials = new Buffer('<none>').toString('base64');
                  return api
  												.delete('/pointScales' + '/' + id)
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
  								var id = location.match(/\/([^\/]+)\/?$/)[1];
                  return removePointScale(id, credentials);
                })
                .then(function(response) {
  								done();
  							})
                .catch(function(err) {
                  done.fail(err);
                });
  		});

      it('should return a 404 HTTP status code in case of non existing point scale with a given id', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
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
  								id = location.match(/\/([^\/]+)\/?$/)[1];
                  return removePointScale(id, credentials);
                })
                .then(function(response) {
                  return api
  												.delete('/pointScales' + '/' + id)
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

      it('should be possible to delete a point scale with a linked level', function(done) {
        var app = {name: 'probedock'};
  			var org = {name: 'Wasabi Technologies'};
  			var pts = {name: 'First Test', description: 'Because you run your first test.'};
        var lvl = {name: 'Probe Dock User', description: 'Because in Probe Dock you trust', points: 0, picture: 'no url yet'};
        var credentials = '';
        var id = -1;
        createApplication(app, credentials)
                .then(function(createdApplication) {
                  credentials = createdApplication.credentials;
                  return createOrganization(org, credentials);
                })
                .then(function(createdOrganization) {
                  credentials = createdOrganization.credentials;
                  return createPointScale(pts, createdOrganization.credentials);
                })
                .then(function(createdPointScale) {
                  var location = createdPointScale.url;
  								id = location.match(/\/([^\/]+)\/?$/)[1];
                  return createLevel(id, lvl, credentials);
                })
                .then(function(createdLevel) {
                  return removePointScale(id, credentials);
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
