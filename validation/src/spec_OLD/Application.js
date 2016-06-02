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

function get(url, authorization) {
  return api
          .get(url)
          .set('Accept', 'application/json')
          .set('Authorization', authorization)
          .expect(200);
}

function getApplications(authorization) {
  return get('/applications/', authorization);
}

function getApplication(applicationId, authorization) {
  return get('/applications/' + applicationId, authorization);
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

function updateApplication(applicationId, payload, authorization) {
  return update('/applications/' + applicationId, payload, authorization)
          .then(function(updatedApplication) {
            var credentials = authorization;
            return {
              url: updatedApplication.url,
              payload: updatedApplication.payload,
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

function removeApplication(applicationId, authorization) {
  return remove('/applications/' + applicationId, authorization);
}

function removeOrganization(organizationId, authorization) {
  return remove('/organizations/' + organizationId, authorization);
}

function purgeApplication() {
  return api
    .get('/applications/purge')
    .expect(200);
}

describe('Applications REST endpoint', function() {

	describe('GET applications', function() {
		it('should return a 200 HTTP status code in case of successful GET processing', function(done) {
			var credentials = '';
			getApplications(credentials)
				.then(function(response) {
					done();
				})
				.catch(function(err) {
          done.fail(err);
        });
		});
	});

	describe('GET applications', function() {
		it('should return an array', function(done) {
			var credentials = '';
			getApplications(credentials)
				.then(function(response) {
					var applications = response.body;
					expect(applications).to.be.an('array');
					done();
				})
				.catch(function(err) {
          done.fail(err);
        });
    });
	});

/*
	describe('GET applications', function() {
		it('should return an empty array when no application exists', function(done) {
			purgeApplication()
		    .then(function(response) {
		    	var credentials = '';
					return getApplications(credentials);
		    })
		    .then(function(response) {
		    	var applications = response.body;
					expect(applications).to.be.empty;
					done();
		    })
		    .catch(function(err) {
          done.fail(err);
        });
		});
	});
*/

	describe('GET applications', function() {
		it('should not return an empty array when applications do exist', function(done) {
			var app = {name: 'probedock'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
              	var applications = createdApplication.payload;
								expect(applications).to.not.be.empty;
								done();
							})
              .catch(function(err) {
                done.fail(err);
              });
		});
	});

/*
	describe('GET applications', function() {
		it('should return a one-sized array when only one application does exist', function(done) {
			var app = {name: 'probedock'};
      var credentials = '';
      purgeApplication()
        .then(function(response) {
          return createApplication(app, credentials)
        })
        .then(function(createdApplication) {
					return getApplications(credentials);
	    	})
	    	.then(function(response) {
	    		var applications = response.body;
					expect(applications).to.have.lengthOf(1);
	    		done();
	    	})
	    	.catch(function(err) {
          done.fail(err);
        });
		});
	});
*/

	describe('GET applications', function() {
		it('should return custom HTTP pagination headers', function(done) {
			var credentials = '';
			getApplications(credentials)
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
/*
  describe('GET applications', function() {
		it('should be possible to sort items', function(done) {
      var app = [
        {name: 'facebook'},
        {name: 'probedock'},
        {name: 'twitter'}
      ];
      var credentials = '';
      purgeApplication()
        .then(function(response) {
          return createApplication(app[0], credentials);
        })
        .then(function(response) {
          return createApplication(app[1], credentials);
        })
        .then(function(response) {
          return createApplication(app[2], credentials);
        })
        .then(function(response) {
          return api
                  .get('/applications?sort=name')
                  .set('Accept', 'application/json')
                  .set('Authorization', credentials)
                  .expect(200);
        })
        .then(function(response) {
          var applications = response.body.map(function(a) {
            return {name: a.name};
          });
          expect(applications).to.eql(app);
          done();
        })
        .catch(function(err) {
          done.fail(err);
        });
    });
	});
*/
  describe('GET applications', function() {
		it('should be possible to limit items', function(done) {
      var app = [
        {name: 'facebook'},
        {name: 'probedock'},
        {name: 'twitter'}
      ];
      var credentials = '';
      var limit = '1';
      createApplication(app[0], credentials)
        .then(function(response) {
          return createApplication(app[1], credentials);
        })
        .then(function(response) {
          return createApplication(app[2], credentials);
        })
        .then(function(response) {
          return api
                  .get('/applications?size=' + limit)
                  .set('Accept', 'application/json')
                  .set('Authorization', credentials)
                  .expect(200);
        })
        .then(function(response) {
          var headers = response.headers;
          var applications = response.body;
          expect(applications).to.have.lengthOf(limit);
          expect(headers['x-pagination-page-size']).to.equal(limit);
          done();
        })
        .catch(function(err) {
          done.fail(err);
        });
    });
	});

  describe('GET applications', function() {
		it('should be possible to select an item page', function(done) {
      var app = [
        {name: 'facebook'},
        {name: 'probedock'},
        {name: 'twitter'}
      ];
      var credentials = '';
      var page = '1';
      var limit = '1';
      createApplication(app[0], credentials)
        .then(function(response) {
          return createApplication(app[1], credentials);
        })
        .then(function(response) {
          return createApplication(app[2], credentials);
        })
        .then(function(response) {
          return api
                  .get('/applications?size=' + limit + '&page=' + page)
                  .set('Accept', 'application/json')
                  .set('Authorization', credentials)
                  .expect(200);
        })
        .then(function(response) {
          var headers = response.headers;
          var applications = response.body;
          expect(applications).to.have.lengthOf(limit);
          expect(headers['x-pagination-page']).to.equal(page);
          done();
        })
        .catch(function(err) {
          done.fail(err);
        });
    });
	});

	describe('POST applications', function() {
		it('should return a 422 HTTP status code when submitting an invalid payload', function(done) {
			var app = {};
			api
				.post('/applications')
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')
				.send(app)
				.expect(422)
				.then(function(response) {
					done();
				})
				.catch(function(err) {
          done.fail(err);
        });
		});
	});

	describe('POST applications', function() {
		it('should be refused when a :name property is missing in the request body', function(done) {
			var app = {};
			var errors = [{reason: 'NotNull', locationType: 'json', location: 'name', message: 'This value is required.'}];
			api
				.post('/applications')
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')
				.send(app)
				.expect(422)
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

	describe('POST applications', function() {
		it('should be refused when the :name property value is too long', function(done) {
			var app = {name: 'a'.repeat(100)};
			var errors = [{reason: 'Size', locationType: 'json', location: 'name', message: 'This value is too long (the maximum is 50 while the actual length is 100).'}];
			api
				.post('/applications')
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')
				.send(app)
				.expect(422)
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

	describe('POST applications', function() {
		it('should return a 201 HTTP status code when an application has been created', function(done) {
			var app = {name: 'probedock'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
								done()
							})
							.catch(function(err) {
			          done.fail(err);
			        });
		});
	});

	describe('POST applications', function() {
		it('should return the created application as the response payload', function(done) {
			var app = {name: 'probedock'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
								var application = createdApplication.payload;
								expect(application).to.not.be.empty;
								done();
							})
							.catch(function(err) {
			          done.fail(err);
			        });
		});
	});

	describe('POST applications', function() {
		it('should return the created application without any organization', function(done) {
			var app = {name: 'probedock'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
								var application = createdApplication.payload;
								var organizations = application.organizations;
								expect(organizations).to.be.empty;
								done();
							})
							.catch(function(err) {
			          done.fail(err);
			        });
		});
	});

	describe('POST applications', function() {
		it('should return an HTTP Location header when an application has been created', function(done) {
			var app = {name: 'probedock'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
								var location = createdApplication.url;
								expect(location).to.not.be.undefined;
								done();
							})
							.catch(function(err) {
			          done.fail(err);
			        });
		});
	});

	describe('POST applications', function() {
		it('should return an HTTP Location header matching the created application URI', function(done) {
			var app = {name: 'probedock'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
								var location = createdApplication.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
								var uri = apiPrefix + '/applications' + '/' + id;
								expect(location).to.equal(uri);
								done();
							})
							.catch(function(err) {
			          done.fail(err);
			        });
		});
	});

	describe('GET application', function() {
		it('should be able to GET an application after having POSTed it from HTTP Location header', function(done) {
			var app = {name: 'probedock'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
								var location = createdApplication.url;
								var id = location.match(/\/([^\/]+)\/?$/)[1];
								return getApplication(id, credentials);
							})
							.then(function(response) {
								var application = response.body;
								expect(application).to.not.be.empty;
								done();
							})
							.catch(function(err) {
			          done.fail(err);
			        });
		});
	});

	describe('GET application', function() {
		it('should return an application with expected properties and expected values', function(done) {
			var app = {name: 'probedock'};
			var id = -1;
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
								id = createdApplication.url.match(/\/([^\/]+)\/?$/)[1];
								return getApplication(id, credentials);
							})
							.then(function(response) {
								var application = response.body;
								expect(application.name).to.equal(app.name);
								expect(application.createdAt).to.equal(application.updatedAt);
								expect(application.href).to.equal(apiPrefix + '/applications/' + id);
								expect(application.organizations).to.not.be.undefined;
								done();
							})
							.catch(function(err) {
			          done.fail(err);
			        });
		});
	});

  describe('GET application', function() {
		it('should return an application with expected organizations after having POSTed one', function(done) {
			var app = {name: 'probedock'};
      var org = {name: 'Wasabi Technologies'};
			var id = -1;
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
								id = createdApplication.url.match(/\/([^\/]+)\/?$/)[1];
                return createOrganization(org, createdApplication.credentials);
							})
              .then(function(response) {
                return getApplication(id, credentials);
              })
							.then(function(response) {
								var application = response.body;
                var organizations = application.organizations;
                expect(organizations).to.have.lengthOf(1);
                expect(organizations[0].name).to.equal(org.name);
								done();
							})
							.catch(function(err) {
			          done.fail(err);
			        });
		});
	});

  describe('GET application', function() {
		it('should return an application with expected organizations after having DELETed one', function(done) {
			var app = {name: 'probedock'};
      var org = {name: 'Wasabi Technologies'};
			var id = -1;
      var appCredentials = '';
      var orgCredentials = '';
      createApplication(app, appCredentials)
              .then(function(createdApplication) {
								id = createdApplication.url.match(/\/([^\/]+)\/?$/)[1];
                orgCredentials = createdApplication.credentials;
                return createOrganization(org, orgCredentials);
							})
              .then(function(createdOrganization) {
                var id = createdOrganization.url.match(/\/([^\/]+)\/?$/)[1];
                return removeOrganization(id, orgCredentials);
              })
              .then(function(response) {
                return getApplication(id, appCredentials);
              })
							.then(function(response) {
								var application = response.body;
                var organizations = application.organizations;
                expect(organizations).to.be.empty;
								done();
							})
							.catch(function(err) {
			          done.fail(err);
			        });
		});
	});

	describe('GET application', function() {
		it('should return a 404 HTTP status code in case of non existing application with a given id', function(done) {
      var app = {name: 'probedock'};
      var credentials = '';
      var id = -1;
      createApplication(app, credentials)
              .then(function(createdApplication) {
								id = createdApplication.url.match(/\/([^\/]+)\/?$/)[1];
								return removeApplication(id, credentials);
              })
              .then(function(response) {
								return api
												.get('/applications' + '/' + id)
												.set('Accept', 'application/json')
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

	describe('PUT application', function() {
		it('should return a 200 HTTP status code in case of successful PUT processing', function(done) {
			var app = {name: 'probedock'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
								var id = createdApplication.url.match(/\/([^\/]+)\/?$/)[1];
								var app = {name: 'probedock'};
								return updateApplication(id, app, credentials);
							})
							.then(function(response) {
								done();
							})
							.catch(function(err) {
			          done.fail(err);
			        });
		});
	});

	describe('PUT application', function() {
		it('should return the updated application as the response payload', function(done) {
			var app = {name: 'probedock'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
								var id = createdApplication.url.match(/\/([^\/]+)\/?$/)[1];
								var app = {name: 'probedock'};
								return updateApplication(id, app, credentials);
							})
							.then(function(updatedApplication) {
								var application = updatedApplication.payload;
								expect(application).to.not.be.empty;
								done();
							})
							.catch(function(err) {
			          done.fail(err);
			        });
		});
	});

  /**
   * Ok, that's the beginning of a pyramid hell :-). It is for that reason that supertest-as-a-promise is a valuable addition to supertest. It
   * allows us to flatten the sequence of async operations. We also have to think about how to organize our API tests. Some tests validate a single
   * API call, others validate a sequence of operations (that's what I usually call end-to-end scenarios). It's not a clear cut distinction, but
   * we should probably manage them a bit differently.
   */
  describe('PUT application', function() {
		it('should update the :name property of the application', function(done) {
			var app = {name: 'probedock'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
								var id = createdApplication.url.match(/\/([^\/]+)\/?$/)[1];
								app = {name: 'probedock'};
								return updateApplication(id, app, credentials);
							})
							.then(function(updateApplication) {
								var application = updateApplication.payload;
								expect(application.name).to.equal(app.name);
								done();
							})
							.catch(function(err) {
			          done.fail(err);
			        });
		});
	});

	describe('PUT application', function() {
		it('should automatically update the :updatedAt property of the application', function(done) {
			var app = {name: 'probdock'};
			var id = -1;
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
								id = createdApplication.url.match(/\/([^\/]+)\/?$/)[1];
								app = {name: 'probedock'};
								return updateApplication(id, app, credentials);
							})
							.then(function(updatedApplication) {
								return getApplication(id, credentials);
							})
							.then(function(response) {
								var application = response.body;
								expect(application.updatedAt).to.above(application.createdAt);
								done();
							})
							.catch(function(err) {
			          done.fail(err);
			        });
		});
	});

	describe('PUT application', function() {
		it('should return a 404 HTTP status code in case of non existing application with a given id', function(done) {
      var app = {name: 'probedock'};
      var credentials = '';
      var id = -1;
      createApplication(app, credentials)
              .then(function(createdApplication) {
								id = createdApplication.url.match(/\/([^\/]+)\/?$/)[1];
								return removeApplication(id, credentials);
              })
              .then(function(response) {
                var app = {name: 'probedock'};
								return api
												.put('/applications' + '/' + id)
												.set('Content-Type', 'application/json')
												.set('Accept', 'application/json')
												.send(app)
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

	describe('PUT application', function() {
		it('should return a 422 HTTP status code when submitting an invalid payload', function(done) {
			var app = {name: 'probedock'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
								var id = createdApplication.url.match(/\/([^\/]+)\/?$/)[1];
								var app = {};
								return api
												.put('/applications' + '/' + id)
												.set('Content-Type', 'application/json')
												.set('Accept', 'application/json')
												.send(app)
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

	describe('PUT application', function() {
		it('should be refused when a :name property is missing in the request body', function(done) {
			var app = {name: 'probedock'};
			var errors = [{reason: 'NotNull', locationType: 'json', location: 'name', message: 'This value is required.'}];
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
								var id = createdApplication.url.match(/\/([^\/]+)\/?$/)[1];
								var app = {};
								return api
												.put('/applications' + '/' + id)
												.set('Content-Type', 'application/json')
												.set('Accept', 'application/json')
												.send(app)
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

	describe('PUT application', function() {
		it('should be refused when the :name property value is too long', function(done) {
			var app = {name: 'probedock'};
			var errors = [{reason: 'Size', locationType: 'json', location: 'name', message: 'This value is too long (the maximum is 50 while the actual length is 100).'}];
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
								var id = createdApplication.url.match(/\/([^\/]+)\/?$/)[1];
								var app = {name: 'a'.repeat(100)};
								return api
												.put('/applications' + '/' + id)
												.set('Content-Type', 'application/json')
												.set('Accept', 'application/json')
												.send(app)
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

/**
 * This specifies that at the moment, we allow clients to delete applications. We will most like change this specification, because it
 * is too dangerous. I am not even sure that we should expose this API call, but we'll see.
 */
	describe('DELETE application', function() {
		it('should return a 204 HTTP status code in case of successful DELETE processing', function(done) {
			var app = {name: 'probedock'};
      var credentials = '';
      createApplication(app, credentials)
              .then(function(createdApplication) {
								var id = createdApplication.url.match(/\/([^\/]+)\/?$/)[1];
                return removeApplication(id, credentials);
							})
							.then(function(response) {
								done();
							})
							.catch(function(err) {
			          done.fail(err);
			        });
		});
	});

	describe('DELETE application', function() {
		it('should return a 404 HTTP status code in case of non existing deleted application with a given id', function(done) {
			var app = {name: 'probedock'};
      var credentials = '';
      var id = -1;
      createApplication(app, credentials)
              .then(function(createdApplication) {
								id = createdApplication.url.match(/\/([^\/]+)\/?$/)[1];
								return removeApplication(id, credentials);
							})
							.then(function(response) {
								return api
												.delete('/applications' + '/' + id)
												.set('Accept', 'application/json')
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
/*
	describe('DELETE application', function() {
		it('should return a 404 HTTP status code in case of non existing application with a given id', function(done) {
			purgeApplication()
		    .then(function(response) {
		    	return api
									.delete('/applications/1')
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
*/
  describe('DELETE application', function() {
    it('should be possible to delete an application with a linked organization', function(done) {
      var app = {name: 'probedock'};
      var org = {name: 'Wasabi Technologies'};
      var credentials = '';
      var id = -1;
      createApplication(app, credentials)
              .then(function(createdApplication) {
                id = createdApplication.url.match(/\/([^\/]+)\/?$/)[1];
                return createOrganization(org, createdApplication.credentials);
              })
              .then(function(createdOrganization) {
                return removeApplication(id, credentials);
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
