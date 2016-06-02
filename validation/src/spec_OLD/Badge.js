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

function createBadge(payload, authorization) {
  return create('/badges/', payload, authorization)
          .then(function(createdBadge) {
            var credentials = authorization;
            return {
              url: createdBadge.url,
              payload: createdBadge.payload,
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

function getBadges(authorization) {
  return get('/badges/', authorization);
}

function getBadge(badgeId, authorization) {
  return get('/badges/' + badgeId, authorization);
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

function updateBadge(badgeId, payload, authorization) {
  return update('/badges/' + badgeId, payload, authorization)
          .then(function(updatedBadge) {
            var credentials = authorization;
            return {
              url: updatedBadge.url,
              payload: updatedBadge.payload,
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

function removeBadge(badgeId, authorization) {
  return remove('/badges/' + badgeId, authorization);
}

describe('Badges REST endpoint', function() {

	describe('GET badges', function() {
		it('should be refused in case of missing credentials', function(done) {
			api
				.get('/badges')
				.set('Accept', 'application/json')
				.expect(401)
				.then(function(response) {
					done();
				})
				.catch(function(err) {
          done.fail(err);
        });
		});
	});

	describe('GET badges', function() {
		it('should be refused in case of wrong credentials', function(done) {
			var authorization = new Buffer('<none>').toString('base64');
			api
				.get('/badges')
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

	describe('GET badges', function() {
		it('should return a 200 HTTP status code in case of successful GET processing', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
                return getBadges(createdOrganization.credentials);
              })
              .then(function(response) {
                done();
              })
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

	describe('GET badges', function() {
		it('should return an array', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
              	return getBadges(createdOrganization.credentials);
              })
              .then(function(response) {
              	var badges = response.body;
								expect(badges).to.be.an('array');
                done();
              })
              .catch(function(err) {
                done.fail(err);
              });
    });
	});

	describe('GET badges', function() {
		it('should return an empty array when no badge exists', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
                return getBadges(createdOrganization.credentials);
              })
              .then(function(response) {
              	var badges = response.body;
								expect(badges).to.be.empty;
                done();
              })
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

	describe('GET badges', function() {
		it('should not return an empty array when badges do exist', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
              	return createBadge(badge, createdOrganization.credentials);
              })
              .then(function(createdBadge) {
                return getBadges(createdBadge.credentials);
              })
              .then(function(response) {
              	var badges = response.body;
								expect(badges).to.not.be.empty;
                done();
              })
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

	describe('GET badges', function() {
		it('should return a one-sized array when only one badge does exist', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
                return createBadge(badge, createdOrganization.credentials);
              })
              .then(function(createdBadge) {
                return getBadges(createdBadge.credentials);
              })
              .then(function(response) {
              	var badges = response.body;
								expect(badges).to.have.lengthOf(1);
                done();
              })
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

	describe('GET badges', function() {
		it('should return custom HTTP pagination headers', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
              	return getBadges(createdOrganization.credentials);
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
	});

  describe('GET badges', function() {
		it('should be possible to sort items', function(done) {
      var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
      var badges = [
        {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'},
        {name: 'Looser', description: 'Because you are useless and you know it.', picture: 'no url yet'},
        {name: 'Pathetic', description: 'Because I said so and that\'s it.', picture: 'no url yet'}
      ];
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	credentials = createdApplication.credentials;
              	return createOrganization(org, credentials);
							})
              .then(function(createdOrganization) {
                credentials = createdOrganization.credentials;
                return createBadge(badges[0], credentials);
              })
              .then(function(createdBadge) {
                return createBadge(badges[1], credentials);
              })
              .then(function(createdBadge) {
                return createBadge(badges[2], credentials);
              })
              .then(function(createdBadge) {
                return api
                        .get('/badges?sort=name')
                        .set('Accept', 'application/json')
                        .set('Authorization', credentials)
                        .expect(200);
              })
              .then(function(response) {
                var b = response.body.map(function(b) {
                  return {name: b.name, description: b.description, picture: b.picture};
                });
                expect(b).to.eql(badges);
                done();
              })
              .catch(function(err) {
                done.fail(err);
              });
    });
	});

  describe('GET badges', function() {
		it('should be possible to limit items', function(done) {
      var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
      var badges = [
        {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'},
        {name: 'Looser', description: 'Because you are useless and you know it.', picture: 'no url yet'},
        {name: 'Pathetic', description: 'Because I said so and that\'s it.', picture: 'no url yet'}
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
                return createBadge(badges[0], credentials);
              })
              .then(function(createdBadge) {
                return createBadge(badges[1], credentials);
              })
              .then(function(createdBadge) {
                return createBadge(badges[2], credentials);
              })
              .then(function(createdBadge) {
                return api
                        .get('/badges?size=' + limit)
                        .set('Accept', 'application/json')
                        .set('Authorization', credentials)
                        .expect(200);
              })
              .then(function(response) {
                var headers = response.headers;
                var badges = response.body;
                expect(badges).to.have.lengthOf(limit);
                expect(headers['x-pagination-page-size']).to.equal(limit);
                done();
              })
              .catch(function(err) {
                done.fail(err);
              });
    });
	});

  describe('GET badges', function() {
		it('should be possible to select an item page', function(done) {
      var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
      var badges = [
        {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'},
        {name: 'Looser', description: 'Because you are useless and you know it.', picture: 'no url yet'},
        {name: 'Pathetic', description: 'Because I said so and that\'s it.', picture: 'no url yet'}
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
                return createBadge(badges[0], credentials);
              })
              .then(function(createdBadge) {
                return createBadge(badges[1], credentials);
              })
              .then(function(createdBadge) {
                return createBadge(badges[2], credentials);
              })
              .then(function(createdBadge) {
                return api
                        .get('/badges?size=' + limit + '&page=' + page)
                        .set('Accept', 'application/json')
                        .set('Authorization', credentials)
                        .expect(200);
              })
              .then(function(response) {
                var headers = response.headers;
                var badges = response.body;
                expect(badges).to.have.lengthOf(limit);
                expect(headers['x-pagination-page']).to.equal(page);
                done();
              })
              .catch(function(err) {
                done.fail(err);
              });
    });
	});

	describe('POST badges', function() {
		it('should be refused in case of missing credentials', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
                return api
												.post('/badges')
												.set('Content-Type', 'application/json')
												.set('Accept', 'application/json')
												.send(badge)
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

	describe('POST badges', function() {
		it('should be refused in case of wrong credentials', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
              	var credentials = new Buffer('<none>').toString('base64');
                return api
												.post('/badges')
												.set('Content-Type', 'application/json')
												.set('Accept', 'application/json')
												.set('Authorization', credentials)
												.send(badge)
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

	describe('POST badges', function() {
		it('should return a 422 HTTP status code when submitting an invalid payload', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
              	credentials = createdOrganization.credentials;
                return api
												.post('/badges')
												.set('Content-Type', 'application/json')
												.set('Accept', 'application/json')
												.set('Authorization', credentials)
												.send(badge)
												.expect(422);
              })
              .then(function(response) {
                done();
              })
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

	describe('POST badges', function() {
		it('should be refused when the expected properties are missing in the request body', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {};
      var credentials = '';
      var errors = [
      	{reason: 'NotNull', locationType: 'json', location: 'name', message: 'This value is required.'},
				{reason: 'NotNull', locationType: 'json', location: 'description', message: 'This value is required.'},
				{reason: 'NotNull', locationType: 'json', location: 'picture', message: 'This value is required.'}
      ];
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
              	credentials = createdOrganization.credentials;
                return api
												.post('/badges')
												.set('Content-Type', 'application/json')
												.set('Accept', 'application/json')
												.set('Authorization', credentials)
												.send(badge)
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

	describe('POST badges', function() {
		it('should be refused when properties values are too long', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {name: 'a'.repeat(26), description: 'a'.repeat(256), picture: 'a'.repeat(256)};
      var credentials = '';
      var errors = [
      	{reason: 'Size', locationType: 'json', location: 'name', message: 'This value is too long (the maximum is 25 while the actual length is 26).'},
				{reason: 'Size', locationType: 'json', location: 'description', message: 'This value is too long (the maximum is 255 while the actual length is 256).'},
				{reason: 'Size', locationType: 'json', location: 'picture', message: 'This value is too long (the maximum is 255 while the actual length is 256).'}
      ];
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
              	credentials = createdOrganization.credentials;
                return api
												.post('/badges')
												.set('Content-Type', 'application/json')
												.set('Accept', 'application/json')
												.set('Authorization', credentials)
												.send(badge)
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

	describe('POST badges', function() {
		it('should return a 201 HTTP status code when a badge has been created', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
                return createBadge(badge, createdOrganization.credentials);
              })
              .then(function() {
                done();
              })
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

	describe('POST badges', function() {
		it('should return the created badge as the response payload', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
              	return createBadge(badge, createdOrganization.credentials);
              })
              .then(function(createdBadge) {
              	var badge = createdBadge.payload;
								expect(badge).to.not.be.empty;
                done();
              })
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

	describe('POST badges', function() {
		it('should return an HTTP Location header when an badge has been created', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
                return createBadge(badge, createdOrganization.credentials);
              })
              .then(function(createdBadge) {
              	var location = createdBadge.url;
								expect(location).to.not.be.undefined;
                done();
              })
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

	describe('POST badges', function() {
		it('should return an HTTP Location header matching the created badge URI', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
                return createBadge(badge, createdOrganization.credentials);
              })
              .then(function(createdBadge) {
              	var location = createdBadge.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
								var uri = apiPrefix + '/badges' + '/' + id;
								expect(location).to.equal(uri);
                done();
              })
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

	describe('GET badge', function() {
		it('should be refused in case of missing credentials', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
              	return createBadge(badge, createdOrganization.credentials);
              })
              .then(function(createdBadge) {
              	var location = createdBadge.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
                return api
												.get('/badges' + '/' + id)
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
	});

	describe('GET badge', function() {
		it('should be refused in case of wrong credentials', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
                return createBadge(badge, createdOrganization.credentials);
              })
              .then(function(createdBadge) {
              	var location = createdBadge.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
								var credentials = new Buffer('<none>').toString('base64');
                return api
												.get('/badges' + '/' + id)
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

	describe('GET badge', function() {
		it('should be able to GET a badge after having POSTed it from HTTP Location header', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
              	return createBadge(badge, createdOrganization.credentials);
              })
              .then(function(createdBadge) {
              	var location = createdBadge.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
                return getBadge(id, createdBadge.credentials);
              })
              .then(function(response) {
              	var badge = response.body;
								expect(badge).to.not.be.empty;
                done();
              })
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

	describe('GET badge', function() {
		it('should return a badge with expected properties and expected values', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'};
      var credentials = '';
      var id = -1;
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
                return createBadge(badge, createdOrganization.credentials);
              })
              .then(function(createdBadge) {
              	var location = createdBadge.url;
								id = location.match(/\/([^\/]+)\/?$/)[1];
                return getBadge(id, createdBadge.credentials);
              })
              .then(function(response) {
              	var b = response.body;
								expect(b.name).to.equal(badge.name);
								expect(b.description).to.equal(badge.description);
								expect(b.picture).to.equal(badge.picture);
								expect(b.createdAt).to.equal(b.updatedAt);
								expect(b.href).to.equal(apiPrefix + '/badges' + '/' + id);
                done();
              })
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

	describe('GET badge', function() {
		it('should return a 404 HTTP status code in case of non existing badge with a given id', function(done) {
      var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'};
      var credentials = '';
      var id = -1;
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
                credentials = createdOrganization.credentials;
              	return createBadge(badge, credentials);
              })
              .then(function(createdBadge) {
              	var location = createdBadge.url;
								id = location.match(/\/([^\/]+)\/?$/)[1];
                return removeBadge(id, credentials);
              })
              .then(function(response) {
                return api
												.get('/badges' + '/' + id)
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

	describe('PUT badge', function() {
		it('should be refused in case of missing credentials', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
              	return createBadge(badge, createdOrganization.credentials);
              })
              .then(function(createdBadge) {
              	var location = createdBadge.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
								badge = {name: 'Useless', description: 'Because you are useless and you know it.', picture: 'still no url yet'};
                return api
												.put('/badges' + '/' + id)
												.set('Content-Type', 'application/json')
												.set('Accept', 'application/json')
												.send(badge)
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

	describe('PUT badge', function() {
		it('should be refused in case of wrong credentials', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
              	return createBadge(badge, createdOrganization.credentials);
              })
              .then(function(createdBadge) {
              	var location = createdBadge.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
								var badge = {name: 'Useless', description: 'Because you are useless and you know it.', picture: 'still no url yet'};
								var credentials = new Buffer('<none>').toString('base64');
                return api
												.put('/badges' + '/' + id)
												.set('Content-Type', 'application/json')
												.set('Accept', 'application/json')
												.set('Authorization', credentials)
												.send(badge)
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

	describe('PUT badge', function() {
		it('should return a 200 HTTP status code in case of successful PUT processing', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
                return createBadge(badge, createdOrganization.credentials);
              })
              .then(function(createdBadge) {
              	var location = createdBadge.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
								badge = {name: 'Useless', description: 'Because you are useless and you know it.', picture: 'still no url yet'};
                return updateBadge(id, badge, createdBadge.credentials);
              })
              .then(function(response) {
                done();
              })
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

	describe('PUT badge', function() {
		it('should return the updated badge as the response payload', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
              	return createBadge(badge, createdOrganization.credentials);
              })
              .then(function(createdBadge) {
              	var location = createdBadge.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
								badge = {name: 'Useless', description: 'Because you are useless and you know it.', picture: 'still no url yet'};
                return updateBadge(id, badge, createdBadge.credentials);
              })
              .then(function(updatedBadge) {
              	var badge = updatedBadge.payload;
								expect(badge).to.not.be.empty;
                done();
              })
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

  describe('PUT badge', function() {
		it('should update the expected properties of the badge', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
              	return createBadge(badge, createdOrganization.credentials);
              })
              .then(function(createdBadge) {
              	var location = createdBadge.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
								badge = {name: 'Useless', description: 'Because you are useless and you know it.', picture: 'still no url yet'};
                return updateBadge(id, badge, createdBadge.credentials);
              })
              .then(function(updatedBadge) {
              	var b = updatedBadge.payload;
								expect(b.name).to.equal(badge.name);
								expect(b.description).to.equal(badge.description);
								expect(b.picture).to.equal(badge.picture);
                done();
              })
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

	describe('PUT badge', function() {
		it('should automatically update the :updatedAt property of the badge', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
                return createBadge(badge, createdOrganization.credentials);
              })
              .then(function(createdBadge) {
              	var location = createdBadge.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
								badge = {name: 'Useless', description: 'Because you are useless and you know it.', picture: 'still no url yet'};
                return updateBadge(id, badge, createdBadge.credentials);
              })
              .then(function(updatedBadge) {
              	var badge = updatedBadge.payload;
              	expect(badge.updatedAt).to.above(badge.createdAt);
                done();
              })
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

	describe('PUT badge', function() {
		it('should return a 404 HTTP status code in case of non existing badge with a given id', function(done) {
      var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'};
      var credentials = '';
      var id = -1;
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
                credentials = createdOrganization.credentials;
              	return createBadge(badge, credentials);
              })
              .then(function(createdBadge) {
              	var location = createdBadge.url;
								id = location.match(/\/([^\/]+)\/?$/)[1];
                return removeBadge(id, credentials);
              })
              .then(function(response) {
                var badge = {name: 'Useless', description: 'Because you are useless and you know it.', picture: 'still no url yet'};
                return api
                        .put('/badges' + '/' + id)
                        .set('Content-Type', 'application/json')
                        .set('Accept', 'application/json')
                        .set('Authorization', credentials)
                        .send(badge)
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

	describe('PUT badge', function() {
		it('should return a 422 HTTP status code when submitting an invalid payload', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
              	return createBadge(badge, createdOrganization.credentials);
              })
              .then(function(createdBadge) {
              	var location = createdBadge.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
								badge = {}
                return api
												.put('/badges' + '/' + id)
												.set('Content-Type', 'application/json')
												.set('Accept', 'application/json')
												.set('Authorization', createdBadge.credentials)
												.send(badge)
												.expect(422);
              })
              .then(function(response) {
                done();
              })
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

	describe('PUT badge', function() {
		it('should be refused when the expected properties are missing in the request body', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'};
      var credentials = '';
      var errors = [
      	{reason: 'NotNull', locationType: 'json', location: 'name', message: 'This value is required.'},
				{reason: 'NotNull', locationType: 'json', location: 'description', message: 'This value is required.'},
				{reason: 'NotNull', locationType: 'json', location: 'picture', message: 'This value is required.'}
      ]
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
                return createBadge(badge, createdOrganization.credentials);
              })
              .then(function(createdBadge) {
              	var location = createdBadge.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
								badge = {}
                return api
												.put('/badges' + '/' + id)
												.set('Content-Type', 'application/json')
												.set('Accept', 'application/json')
												.set('Authorization', createdBadge.credentials)
												.send(badge)
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

	describe('PUT badge', function() {
		it('should be refused when expected properties values are too long', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'};
      var credentials = '';
      var errors = [
      	{reason: 'Size', locationType: 'json', location: 'name', message: 'This value is too long (the maximum is 25 while the actual length is 26).'},
				{reason: 'Size', locationType: 'json', location: 'description', message: 'This value is too long (the maximum is 255 while the actual length is 256).'},
				{reason: 'Size', locationType: 'json', location: 'picture', message: 'This value is too long (the maximum is 255 while the actual length is 256).'}
      ]
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
              	return createBadge(badge, createdOrganization.credentials);
              })
              .then(function(createdBadge) {
              	var location = createdBadge.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
								badge = {name: 'a'.repeat(26), description: 'a'.repeat(256), picture: 'a'.repeat(256)};
                return api
												.put('/badges' + '/' + id)
												.set('Content-Type', 'application/json')
												.set('Accept', 'application/json')
												.set('Authorization', createdBadge.credentials)
												.send(badge)
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

	describe('DELETE badge', function() {
		it('should be refused in case of missing credentials', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
              	return createBadge(badge, createdOrganization.credentials);
              })
              .then(function(createdBadge) {
              	var location = createdBadge.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
                return api
												.delete('/badges' + '/' + id)
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

	describe('DELETE badge', function() {
		it('should be refused in case of wrong credentials', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
              	return createBadge(badge, createdOrganization.credentials);
              })
              .then(function(createdBadge) {
              	var location = createdBadge.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
								var credentials = new Buffer('<none>').toString('base64');
                return api
												.delete('/badges' + '/' + id)
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

	describe('DELETE badge', function() {
		it('should return a 204 HTTP status code in case of successful DELETE processing', function(done) {
      var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
                credentials = createdOrganization.credentials;
              	return createBadge(badge, credentials);
              })
              .then(function(createdBadge) {
              	var location = createdBadge.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
                return removeBadge(id, credentials);
              })
              .then(function(response) {
								done();
							})
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

	describe('DELETE badge', function() {
		it('should return a 404 HTTP status code in case of non existing badge with a given id', function(done) {
      var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'};
      var credentials = '';
      var id = -1;
      createApplication(app, credentials)
              .then(function(createdApplication) {
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
                credentials = createdOrganization.credentials;
              	return createBadge(badge, credentials);
              })
              .then(function(createdBadge) {
              	var location = createdBadge.url;
								id = location.match(/\/([^\/]+)\/?$/)[1];
                return removeBadge(id, credentials);
              })
              .then(function(response) {
                return api
												.delete('/badges' + '/' + id)
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
