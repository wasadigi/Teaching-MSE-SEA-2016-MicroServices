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
  return create('/applications/', payload, authorization)
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
          .then(function (createdOrganization) {
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

function get(url, authorization) {
  return api
          .get(url)
          .set('Accept', 'application/json')
          .set('Authorization', authorization)
          .expect(200);
}

function getOrganizations(authorization) {
  return get('/organizations/', authorization);
}

function getOrganization(organizationId, authorization) {
  return get('/organizations/' + organizationId, authorization);
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

function updateOrganization(organizationId, payload, authorization) {
  return update('/organizations/' + organizationId, payload, authorization)
          .then(function(updatedOrganization) {
            var credentials = authorization;
            return {
              url: updatedOrganization.url,
              payload: updatedOrganization.payload,
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

function removeOrganization(organizationId, authorization) {
  return remove('/organizations/' + organizationId, authorization);
}

function removeBadge(badgeId, authorization) {
  return remove('/badges/' + badgeId, authorization);
}

function removePointScale(pointScaleId, authorization) {
  return remove('/pointScales/' + pointScaleId, authorization);
}

describe('Organizations REST endpoint', function() {

	describe('GET organizations', function() {
		it('should be refused in case of missing credentials', function(done) {
			api
				.get('/organizations')
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

	describe('GET organizations', function() {
		it('should be refused in case of wrong credentials', function(done) {
			var credentials = new Buffer('<none>').toString('base64');
			api
				.get('/organizations')
				.set('Accept', 'application/json')
				.set('Authorization', credentials)
				.expect(401)
				.then(function(response) {
					done();
				})
				.catch(function(err) {
          done.fail(err);
        });
		});
	});

	describe('GET organizations', function() {
		it('should return a 200 HTTP status code in case of successful GET processing', function(done) {
			var app = {name: 'probedock'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	return getOrganizations(createdApplication.credentials);
							})
							.then(function(response) {
								done();
							})
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

	describe('GET organizations', function() {
		it('should return an array', function(done) {
			var app = {name: 'probedock'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	return getOrganizations(createdApplication.credentials);
							})
							.then(function(response) {
								var organizations = response.body;
								expect(organizations).to.be.an('array');
								done();
							})
              .catch(function(err) {
                done.fail(err);
              });
    });
	});

	describe('GET organizations', function() {
		it('should return an empty array when no organization exists', function(done) {
			var app = {name: 'probedock'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	return getOrganizations(createdApplication.credentials);
							})
							.then(function(response) {
								var organizations = response.body;
								expect(organizations).to.be.empty;
								done();
							})
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

	describe('GET organizations', function() {
		it('should not return an empty array when organizations do exist', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	credentials = createdApplication.credentials;
              	return createOrganization(org, credentials);
							})
							.then(function(createdOrganization) {
								return getOrganizations(credentials);
							})
							.then(function(response) {
								var organizations = response.body;
								expect(organizations).to.not.be.empty;
								done();
							})
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

	describe('GET organizations', function() {
		it('should return a one-sized array when only one organization does exist', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	credentials = createdApplication.credentials;
              	return createOrganization(org, credentials);
							})
							.then(function(createdOrganization) {
								return getOrganizations(credentials);
							})
							.then(function(response) {
								var organizations = response.body;
								expect(organizations).to.have.lengthOf(1);
								done();
							})
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

	describe('GET organizations', function() {
		it('should return custom HTTP pagination headers', function(done) {
			var app = {name: 'probedock'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	return getOrganizations(createdApplication.credentials);
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

  describe('GET organizations', function() {
		it('should be possible to sort items', function(done) {
      var app = {name: 'probedock'};
			var org = [
        {name: 'HEIGVD-RES-2016'},
        {name: 'Prevole\'s Company'},
        {name: 'Wasabi Technologies'}
      ];
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	credentials = createdApplication.credentials;
              	return createOrganization(org[0], credentials);
							})
              .then(function(createdOrganization) {
								return createOrganization(org[1], credentials);
							})
              .then(function(createdOrganization) {
								return createOrganization(org[2], credentials);
							})
							.then(function(createdOrganization) {
								return getOrganizations(credentials);
							})
              .then(function(response) {
                return api
                        .get('/organizations?sort=name')
                        .set('Accept', 'application/json')
                        .set('Authorization', credentials)
                        .expect(200);
              })
              .then(function(response) {
                var organizations = response.body.map(function(o) {
                  return {name: o.name};
                });
                expect(organizations).to.eql(org);
                done();
              })
              .catch(function(err) {
                done.fail(err);
              });
    });
	});

  describe('GET organizations', function() {
		it('should be possible to limit items', function(done) {
      var app = {name: 'probedock'};
			var org = [
        {name: 'HEIGVD-RES-2016'},
        {name: 'Prevole\'s Company'},
        {name: 'Wasabi Technologies'}
      ];
      var credentials = '';
      var limit = '1';
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	credentials = createdApplication.credentials;
              	return createOrganization(org[0], credentials);
							})
              .then(function(createdOrganization) {
								return createOrganization(org[1], credentials);
							})
              .then(function(createdOrganization) {
								return createOrganization(org[2], credentials);
							})
							.then(function(createdOrganization) {
								return getOrganizations(credentials);
							})
              .then(function(response) {
                return api
                        .get('/organizations?size=' + limit)
                        .set('Accept', 'application/json')
                        .set('Authorization', credentials)
                        .expect(200);
              })
              .then(function(response) {
                var headers = response.headers;
                var organizations = response.body;
                expect(organizations).to.have.lengthOf(limit);
                expect(headers['x-pagination-page-size']).to.equal(limit);
                done();
              })
              .catch(function(err) {
                done.fail(err);
              });
    });
	});

  describe('GET organizations', function() {
		it('should be possible to select an item page', function(done) {
      var app = {name: 'probedock'};
			var org = [
        {name: 'HEIGVD-RES-2016'},
        {name: 'Prevole\'s Company'},
        {name: 'Wasabi Technologies'}
      ];
      var credentials = '';
      var page = '1';
      var limit = '1';
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	credentials = createdApplication.credentials;
              	return createOrganization(org[0], credentials);
							})
              .then(function(createdOrganization) {
								return createOrganization(org[1], credentials);
							})
              .then(function(createdOrganization) {
								return createOrganization(org[2], credentials);
							})
							.then(function(createdOrganization) {
								return getOrganizations(credentials);
							})
              .then(function(response) {
                return api
                        .get('/organizations?size=' + limit + '&page=' + page)
                        .set('Accept', 'application/json')
                        .set('Authorization', credentials)
                        .expect(200);
              })
              .then(function(response) {
                var headers = response.headers;
                var organizations = response.body;
                expect(organizations).to.have.lengthOf(limit);
                expect(headers['x-pagination-page']).to.equal(page);
                done();
              })
              .catch(function(err) {
                done.fail(err);
              });
    });
	});

	describe('POST organizations', function() {
		it('should be refused in case of missing credentials', function(done) {
			var org = {};
			api
				.post('/organizations')
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')
				.send(org)
				.expect(401)
				.then(function(response) {
					done();
				})
				.catch(function(err) {
          done.fail(err);
        });
		});
	});

	describe('POST organizations', function() {
		it('should be refused in case of wrong credentials', function(done) {
			var org = {};
			var credentials = new Buffer('<none>').toString('base64');
			api
				.post('/organizations')
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')
				.set('Authorization', credentials)
				.send(org)
				.expect(401)
				.then(function(response) {
					done();
				})
				.catch(function(err) {
          done.fail(err);
        });
		});
	});

	describe('POST organizations', function() {
		it('should return a 422 HTTP status code when submitting an invalid payload', function(done) {
			var app = {name: 'probedock'};
			var org = {};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	credentials = createdApplication.credentials;
                return api
												.post('/organizations')
												.set('Content-Type', 'application/json')
												.set('Accept', 'application/json')
												.set('Authorization', credentials)
												.send(org)
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

	describe('POST organizations', function() {
		it('should be refused when a :name property is missing in the request body', function(done) {
			var app = {name: 'probedock'};
			var org = {};
      var credentials = '';
      var errors = [{reason: 'NotNull', locationType: 'json', location: 'name', message: 'This value is required.'}];
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	credentials = createdApplication.credentials;
                return api
												.post('/organizations')
												.set('Content-Type', 'application/json')
												.set('Accept', 'application/json')
												.set('Authorization', credentials)
												.send(org)
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

	describe('POST organizations', function() {
		it('should be refused when the :name property value is too long', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'a'.repeat(100)};
      var credentials = '';
      var errors = [{reason: 'Size', locationType: 'json', location: 'name', message: 'This value is too long (the maximum is 50 while the actual length is 100).'}];
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	credentials = createdApplication.credentials;
                return api
												.post('/organizations')
												.set('Content-Type', 'application/json')
												.set('Accept', 'application/json')
												.set('Authorization', credentials)
												.send(org)
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

	describe('POST organizations', function() {
		it('should return a 201 HTTP status code when an organization has been created', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	return createOrganization(org, createdApplication.credentials);
							})
							.then(function(createdOrganization) {
								done();
							})
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

	describe('POST organizations', function() {
		it('should return the created organization as the response payload', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	return createOrganization(org, createdApplication.credentials);
							})
							.then(function(createdOrganization) {
								var organization = createdOrganization.payload;
								expect(organization).to.not.be.empty;
								done();
							})
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

	describe('POST organizations', function() {
		it('should return the created organization without any badge', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	return createOrganization(org, createdApplication.credentials);
							})
							.then(function(createdOrganization) {
								var organization = createdOrganization.payload;
								var badges = organization.badges;
								expect(badges).to.be.empty;
								done();
							})
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

	describe('POST organizations', function() {
		it('should return an HTTP Location header when an organization has been created', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	return createOrganization(org, createdApplication.credentials);
							})
							.then(function(createdOrganization) {
								var location = createdOrganization.url;
								expect(location).to.not.be.undefined;
								done();
							})
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

	describe('POST organizations', function() {
		it('should return an HTTP Location header matching the created organization URI', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	return createOrganization(org, createdApplication.credentials);
							})
							.then(function(createdOrganization) {
								var location = createdOrganization.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
								var uri = apiPrefix + '/organizations' + '/' + id;
								expect(location).to.equal(uri);
								done();
							})
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

	describe('GET organization', function() {
		it('should be refused in case of missing credentials', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	return createOrganization(org, createdApplication.credentials);
							})
							.then(function(createdOrganization) {
								var location = createdOrganization.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
								return api
												.get('/organizations' + '/' + id)
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

	describe('GET organization', function() {
		it('should be refused in case of wrong credentials', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	return createOrganization(org, createdApplication.credentials);
							})
							.then(function(createdOrganization) {
								var location = createdOrganization.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
								credentials = new Buffer('<none>').toString('base64');
								return api
												.get('/organizations' + '/' + id)
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

	describe('GET organization', function() {
		it('should be able to GET an organization after having POSTed it from HTTP Location header', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	credentials = createdApplication.credentials;
              	return createOrganization(org, createdApplication.credentials);
							})
							.then(function(createdOrganization) {
								var location = createdOrganization.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
								return getOrganization(id, credentials);
							})
							.then(function(response) {
								var organization = response.body;
								expect(organization).to.not.be.empty;
								done();
							})
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

	describe('GET organization', function() {
		it('should return an organization with expected properties and expected values', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
      var credentials = '';
      var id = -1;
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	credentials = createdApplication.credentials;
              	return createOrganization(org, createdApplication.credentials);
							})
							.then(function(createdOrganization) {
								var location = createdOrganization.url;
								id = location.match(/\/([^\/]+)\/?$/)[1];
								return getOrganization(id, credentials);
							})
							.then(function(response) {
								var organization = response.body;
								expect(organization.name).to.equal(org.name);
								expect(organization.createdAt).to.equal(organization.updatedAt);
								expect(organization.href).to.equal(apiPrefix + '/organizations' + '/' + id);
								expect(organization.badges).to.not.be.undefined;
								done();
							})
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

  describe('GET application', function() {
		it('should return an organization with expected badges after having POSTed one', function(done) {
      var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'};
      var credentials = '';
      var id = -1;
      createApplication(app, credentials)
              .then(function(createdApplication) {
                credentials = createdApplication.credentials;
                return createOrganization(org, credentials);
              })
              .then(function(createdOrganization) {
                id = createdOrganization.url.match(/\/([^\/]+)\/?$/)[1];
                return createBadge(badge, createdOrganization.credentials);
              })
              .then(function(response) {
                return getOrganization(id, credentials);
              })
              .then(function(response) {
								var organization = response.body;
                var badges = organization.badges;
                expect(badges).to.have.lengthOf(1);
                expect(badges[0].name).to.equal(badge.name);
								done();
							})
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

  describe('GET application', function() {
		it('should return an organization with expected badges after having DELETed one', function(done) {
      var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'};
      var appCredentials = '';
      var orgCredentials = '';
      var badgeCredentials = '';
      var id = -1;
      createApplication(app, appCredentials)
              .then(function(createdApplication) {
                orgCredentials = createdApplication.credentials;
                return createOrganization(org, orgCredentials);
              })
              .then(function(createdOrganization) {
                id = createdOrganization.url.match(/\/([^\/]+)\/?$/)[1];
                badgeCredentials = createdOrganization.credentials;
                return createBadge(badge, badgeCredentials);
              })
              .then(function(createdBadge) {
                var id = createdBadge.url.match(/\/([^\/]+)\/?$/)[1];
                return removeBadge(id, badgeCredentials);
              })
              .then(function(response) {
                return getOrganization(id, orgCredentials);
              })
              .then(function(response) {
								var organization = response.body;
                var badges = organization.badges;
                expect(badges).to.be.empty;
								done();
							})
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

  describe('GET application', function() {
		it('should return an organization with expected point scales after having POSTed one', function(done) {
      var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var pts = {name: 'First Test', description: 'Because you run your first test.'};
      var credentials = '';
      var id = -1;
      createApplication(app, credentials)
              .then(function(createdApplication) {
                credentials = createdApplication.credentials;
                return createOrganization(org, credentials);
              })
              .then(function(createdOrganization) {
                id = createdOrganization.url.match(/\/([^\/]+)\/?$/)[1];
                return createPointScale(pts, createdOrganization.credentials);
              })
              .then(function(response) {
                return getOrganization(id, credentials);
              })
              .then(function(response) {
								var organization = response.body;
                var pointScales = organization.pointScales;
                expect(pointScales).to.have.lengthOf(1);
                expect(pointScales[0].name).to.equal(pts.name);
								done();
							})
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

  describe('GET application', function() {
		it('should return an organization with expected point scales after having DELETed one', function(done) {
      var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var pts = {name: 'First Test', description: 'Because you run your first test.'};
      var appCredentials = '';
      var orgCredentials = '';
      var ptsCredentials = '';
      var id = -1;
      createApplication(app, appCredentials)
              .then(function(createdApplication) {
                orgCredentials = createdApplication.credentials;
                return createOrganization(org, orgCredentials);
              })
              .then(function(createdOrganization) {
                id = createdOrganization.url.match(/\/([^\/]+)\/?$/)[1];
                ptsCredentials = createdOrganization.credentials;
                return createPointScale(pts, ptsCredentials);
              })
              .then(function(createdBadge) {
                var id = createdBadge.url.match(/\/([^\/]+)\/?$/)[1];
                return removePointScale(id, ptsCredentials);
              })
              .then(function(response) {
                return getOrganization(id, orgCredentials);
              })
              .then(function(response) {
                var organization = response.body;
                var pointScales = organization.pointScales;
                expect(pointScales).to.be.empty;
								done();
							})
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

	describe('GET organization', function() {
		it('should return a 404 HTTP status code in case of non existing organization with a given id', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
      var credentials = '';
      var id = -1;
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	credentials = createdApplication.credentials;
              	return createOrganization(org, credentials);
							})
							.then(function(createdOrganization) {
								var location = createdOrganization.url;
								id = location.match(/\/([^\/]+)\/?$/)[1];
                return removeOrganization(id, credentials);
							})
							.then(function(response) {
								return api
												.get('/organizations' + '/' + id)
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

	describe('PUT organization', function() {
		it('should be refused in case of missing credentials', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technology'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	return createOrganization(org, createdApplication.credentials);
							})
							.then(function(createdOrganization) {
								var location = createdOrganization.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
								org = {name: 'Wasabi Technologies'};
								return api
												.put('/organizations' + '/' + id)
												.set('Content-Type', 'application/json')
												.set('Accept', 'application/json')
												.send(org)
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

	describe('PUT organization', function() {
		it('should be refused in case of wrong credentials', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technology'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	return createOrganization(org, createdApplication.credentials);
							})
							.then(function(createdOrganization) {
								var location = createdOrganization.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
								org = {name: 'Wasabi Technologies'};
								credentials = new Buffer('<none>').toString('base64');
								return api
												.put('/organizations' + '/' + id)
												.set('Content-Type', 'application/json')
												.set('Accept', 'application/json')
												.set('Authorization', credentials)
												.send(org)
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

	describe('PUT organization', function() {
		it('should return a 200 HTTP status code in case of successful PUT processing', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologiy'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	credentials = createdApplication.credentials;
              	return createOrganization(org, credentials);
							})
							.then(function(createdOrganization) {
								var location = createdOrganization.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
								var org = {name: 'Wasabi Technologies'};
								return updateOrganization(id, org, credentials);
							})
							.then(function(response) {
								done();
							})
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

	describe('PUT organization', function() {
		it('should return the updated organization as the response payload', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technology'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	credentials = createdApplication.credentials;
              	return createOrganization(org, credentials);
							})
							.then(function(createdOrganization) {
								var location = createdOrganization.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
								var org = {name: 'Wasabi Technologies'};
								return updateOrganization(id, org, credentials);
							})
							.then(function(updatedOrganization) {
								var organization = updatedOrganization.payload;
								expect(organization).to.not.be.empty;
								done();
							})
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

  describe('PUT organization', function() {
		it('should update the :name property of the organization', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technology'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	credentials = createdApplication.credentials;
              	return createOrganization(org, credentials);
							})
							.then(function(createdOrganization) {
								var location = createdOrganization.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
								org = {name: 'Wasabi Technologies'};
								return updateOrganization(id, org, credentials);
							})
							.then(function(updatedOrganization) {
								var organization = updatedOrganization.payload;
								expect(organization.name).to.equal(org.name);
								done();
							})
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

	describe('PUT organization', function() {
		it('should automatically update the :updatedAt property of the organization', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technology'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	credentials = createdApplication.credentials;
              	return createOrganization(org, credentials);
							})
							.then(function(createdOrganization) {
								var location = createdOrganization.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
								org = {name: 'Wasabi Technologies'};
								return updateOrganization(id, org, credentials);
							})
							.then(function(updatedOrganization) {
								var organization = updatedOrganization.payload;
								expect(organization.updatedAt).to.above(organization.createdAt);
								done();
							})
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

	describe('PUT organization', function() {
		it('should return a 404 HTTP status code in case of non existing organization with a given id', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technology'};
      var credentials = '';
      var id = -1;
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	credentials = createdApplication.credentials;
              	return createOrganization(org, credentials);
							})
							.then(function(createdOrganization) {
								var location = createdOrganization.url;
								id = location.match(/\/([^\/]+)\/?$/)[1];
                return removeOrganization(id, credentials);
							})
							.then(function(response) {
								var org = {name: 'Wasabi Technologies'};
								return api
												.put('/organizations' + '/' + id)
												.set('Content-Type', 'application/json')
												.set('Accept', 'application/json')
												.set('Authorization', credentials)
												.send(org)
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

	describe('PUT organization', function() {
		it('should return a 422 HTTP status code when submitting an invalid payload', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	credentials = createdApplication.credentials;
              	return createOrganization(org, credentials);
							})
							.then(function(createdOrganization) {
								var location = createdOrganization.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
								org = {};
								return api
												.put('/organizations' + '/' + id)
												.set('Content-Type', 'application/json')
												.set('Accept', 'application/json')
												.set('Authorization', credentials)
												.send(org)
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

	describe('PUT organization', function() {
		it('should be refused when a :name property is missing in the request body', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
      var credentials = '';
      var errors = [{reason: 'NotNull', locationType: 'json', location: 'name', message: 'This value is required.'}];
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	credentials = createdApplication.credentials;
              	return createOrganization(org, credentials);
							})
							.then(function(createdOrganization) {
								var location = createdOrganization.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
								org = {};
								return api
												.put('/organizations' + '/' + id)
												.set('Content-Type', 'application/json')
												.set('Accept', 'application/json')
												.set('Authorization', credentials)
												.send(org)
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

	describe('PUT organization', function() {
		it('should be refused when the :name property value is too long', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
      var credentials = '';
      var errors = [{reason: 'Size', locationType: 'json', location: 'name', message: 'This value is too long (the maximum is 50 while the actual length is 100).'}];
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	credentials = createdApplication.credentials;
              	return createOrganization(org, credentials);
							})
							.then(function(createdOrganization) {
								var location = createdOrganization.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
								org = {name: 'a'.repeat(100)};
								return api
												.put('/organizations' + '/' + id)
												.set('Content-Type', 'application/json')
												.set('Accept', 'application/json')
												.set('Authorization', credentials)
												.send(org)
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

	describe('DELETE organization', function() {
		it('should be refused in case of missing credentials', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	return createOrganization(org, createdApplication.credentials);
							})
							.then(function(createdOrganization) {
								var location = createdOrganization.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
								return api
												.delete('/organizations' + '/' + id)
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

	describe('DELETE organization', function() {
		it('should be refused in case of wrong credentials', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	return createOrganization(org, createdApplication.credentials);
							})
							.then(function(createdOrganization) {
								var location = createdOrganization.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
								credentials = new Buffer('<none>').toString('base64');
								return api
												.delete('/organizations' + '/' + id)
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

	describe('DELETE organization', function() {
		it('should return a 204 HTTP status code in case of successful DELETE processing', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	credentials = createdApplication.credentials;
              	return createOrganization(org, credentials);
							})
							.then(function(createdOrganization) {
								var location = createdOrganization.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
                return removeOrganization(id, credentials);
							})
							.then(function(response) {
								done();
							})
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

	describe('DELETE organization', function() {
		it('should return a 404 HTTP status code in case of non existing organization with a given id', function(done) {
			var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
      var credentials = '';
      var id = -1;
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	credentials = createdApplication.credentials;
              	return createOrganization(org, credentials);
							})
							.then(function(createdOrganization) {
								var location = createdOrganization.url;
								id = location.match(/\/([^\/]+)\/?$/)[1];
                return removeOrganization(id, credentials);
							})
							.then(function(response) {
								return api
												.delete('/organizations' + '/' + id)
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

  describe('DELETE organization', function() {
    it('should be possible to delete an organization with a linked badge', function(done) {
      var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var badge = {name: 'Hero', description: 'Because you did something good.', picture: 'no url yet'};
      var credentials = '';
      var id = -1;
      createApplication(app, credentials)
              .then(function(createdApplication) {
                credentials = createdApplication.credentials;
                return createOrganization(org, credentials);
              })
              .then(function(createdOrganization) {
                id = createdOrganization.url.match(/\/([^\/]+)\/?$/)[1];
                return createBadge(badge, createdOrganization.credentials);
              })
              .then(function(response) {
                return removeOrganization(id, credentials);
              })
              .then(function(response) {
								done();
							})
              .catch(function(err) {
                done.fail(err);
              });
    });
  });

  describe('DELETE organization', function() {
    it('should be possible to delete an organization with a linked point scale', function(done) {
      var app = {name: 'probedock'};
			var org = {name: 'Wasabi Technologies'};
			var pts = {name: 'First Test', description: 'Because you run your first test.'};
      var credentials = '';
      var id = -1;
      createApplication(app, credentials)
              .then(function(createdApplication) {
                credentials = createdApplication.credentials;
                return createOrganization(org, credentials);
              })
              .then(function(createdOrganization) {
                id = createdOrganization.url.match(/\/([^\/]+)\/?$/)[1];
                return createPointScale(pts, createdOrganization.credentials);
              })
              .then(function(response) {
                return removeOrganization(id, credentials);
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
