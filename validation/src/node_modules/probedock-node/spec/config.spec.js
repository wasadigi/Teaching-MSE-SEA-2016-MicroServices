var _ = require('underscore'),
    factory = require('../lib/config'),
    merge = require('deepmerge'),
    yaml = require('js-yaml');

describe("config", function() {

  var config, configClass, envMock, files, fsMock, sampleConfig;
  beforeEach(function() {

    files = {};

    envMock = {
      HOME: '/home'
    };

    fsMock = {
      existsSync: function(path) {
        return !!files[path];
      },
      readFileSync: function(path) {
        return files[path];
      }
    };

    sampleConfig = {
      publish: false,
      servers: {
        localhost: {
          apiUrl: 'http://localhost',
          apiToken: 'foo'
        },
        'example.com': {
          apiUrl: 'http://example.com',
          apiToken: 'baz',
          projectApiId: 'bar'
        }
      },
      server: 'localhost',
      project: {
        apiId: 'foo',
        version: '1.0.0',
        category: 'cat',
        tags: [ 'yee', 'haw' ],
        tickets: [ '100', '200' ]
      },
      workspace: '/tmp',
      payload: {
        print: true,
        save: true
      }
    };

    configClass = factory(envMock, fsMock);
    config = new configClass();
  });

  function configData() {
    return _.pick(config, 'payload', 'project', 'publish', 'server', 'servers', 'testRunUid', 'workspace');
  }

  it("should accept options at construction", function() {
    var configWithUid = _.extend(sampleConfig, { testRunUid: 'yooayedee' });
    config = new configClass(configWithUid);
    expect(configData()).toEqual(configWithUid);
  });

  describe("load", function() {

    it("should have the correct defaults", function() {
      config.load();
      expect(configData()).toEqual({
        publish: true,
        project: {},
        payload: {}
      });
    });

    it("should load custom configuration options", function() {
      var configWithUid = _.extend(sampleConfig, { testRunUid: 'yooayedee' });
      config.load(configWithUid);
      expect(configData()).toEqual(configWithUid);
    });

    it("should load the home configuration file", function() {
      files['/home/.probedock/config.yml'] = yaml.safeDump(sampleConfig);
      config.load();
      expect(configData()).toEqual(sampleConfig);
    });

    it("should load the project configuration file", function() {
      files['probedock.yml'] = yaml.safeDump(sampleConfig);
      config.load();
      expect(configData()).toEqual(sampleConfig);
    });

    it("should load the project configuration file from a custom location", function() {
      files['custom.yml'] = yaml.safeDump(sampleConfig);
      _.extend(envMock, { PROBEDOCK_CONFIG: 'custom.yml' });
      config.load();
      expect(configData()).toEqual(sampleConfig);
    });

    it("should not load a project configuration file that doesn't exist", function() {
      files['/home/.probedock/config.yml'] = yaml.safeDump({ workspace: '/tmp' });
      _.extend(envMock, { PROBEDOCK_CONFIG: 'foo' });
      config.load();
      expect(configData()).toEqual({
        publish: true,
        project: {},
        payload: {},
        workspace: '/tmp'
      });
    });

    it("should load configuration through environment variables", function() {
      _.extend(envMock, {
        PROBEDOCK_PUBLISH: '0',
        PROBEDOCK_SERVER: 'example.com',
        PROBEDOCK_WORKSPACE: '/tmp',
        PROBEDOCK_PRINT_PAYLOAD: '1',
        PROBEDOCK_SAVE_PAYLOAD: '1',
        PROBEDOCK_TEST_REPORT_UID: 'yooayedee'
      });
      config.load();
      expect(configData()).toEqual({
        publish: false,
        project: {},
        server: 'example.com',
        workspace: '/tmp',
        payload: {
          print: true,
          save: true
        },
        testRunUid: 'yooayedee'
      });
    });

    it("should override home configuration file options with project configuration file options", function() {

      var overrides = {
        publish: false,
        servers: {
          localhost: {
            projectApiId: 'foo'
          },
          'example.com': {
            apiUrl: 'http://example.com/probedock',
            apiKeySecret: 'quxx'
          }
        },
        server: 'example.com',
        project: {
          apiId: 'foo',
          version: '1.0.1',
          category: 'dog',
          tags: [ 'yay' ],
          tickets: [ '300', '400' ]
        },
        workspace: '/home/tmp',
        payload: {
          save: false
        }
      };

      files['/home/.probedock/config.yml'] = yaml.safeDump(sampleConfig);
      files['probedock.yml'] = yaml.safeDump(overrides);

      config.load();
      expect(configData()).toEqual(merge(sampleConfig, overrides));
    });

    it("should override configuration file options with custom configuration options", function() {

      var overrides = {
        publish: false,
        servers: {
          localhost: {
            projectApiId: 'foo'
          },
          'example.com': {
            apiUrl: 'http://example.com/probedock',
            apiKeySecret: 'quxx'
          }
        },
        server: 'example.com',
        project: {
          apiId: 'foo',
          version: '1.0.1',
          category: 'dog',
          tags: [ 'yay' ],
          tickets: [ '300', '400' ]
        },
        workspace: '/home/tmp',
        payload: {
          save: false
        },
        testRunUid: 'yooayedee'
      };

      files['/home/.probedock/config.yml'] = yaml.safeDump(sampleConfig);
      config.load(overrides);

      expect(configData()).toEqual(merge(sampleConfig, overrides));
    });

    it("should override custom configuration options with environment variable options", function() {

      _.extend(envMock, {
        PROBEDOCK_PUBLISH: '0',
        PROBEDOCK_SERVER: 'example.com',
        PROBEDOCK_WORKSPACE: '/home/tmp',
        PROBEDOCK_PRINT_PAYLOAD: '0',
        PROBEDOCK_SAVE_PAYLOAD: '0',
        PROBEDOCK_TEST_REPORT_UID: 'yooeyedee'
      });
      config.load(_.extend(sampleConfig, { testRunUid: 'yooayedee' }));

      expect(configData()).toEqual(merge(sampleConfig, {
        publish: false,
        server: 'example.com',
        workspace: '/home/tmp',
        payload: {
          save: false,
          print: false,
          save: false
        },
        testRunUid: 'yooeyedee'
      }));
    });

    it("should apply all overrides", function() {

      files['/home/.probedock/config.yml'] = yaml.safeDump(sampleConfig);

      files['probedock.yml'] = yaml.safeDump({
        publish: false,
        servers: {
          localhost: {
            apiUrl: 'http://localhost:3000'
          }
        },
        project: {
          apiId: 'top'
        },
        workspace: '/home/tmp'
      });

      var customConfig = {
        servers: {
          localhost: {
            apiUrl: 'http://localhost:3001'
          }
        },
        project: {
          apiId: 'down'
        },
        workspace: '/home/playground',
        testRunUid: 'yooeyedee'
      };

      _.extend(envMock, {
        PROBEDOCK_WORKSPACE: '/playground',
        PROBEDOCK_TEST_REPORT_UID: 'yooayedee'
      });

      config.load(customConfig);
      expect(configData()).toEqual(merge(sampleConfig, {
        publish: false,
        servers: {
          localhost: {
            apiUrl: 'http://localhost:3001'
          }
        },
        project: {
          apiId: 'down'
        },
        workspace: '/playground',
        testRunUid: 'yooayedee'
      }));
    });

    it("should parse boolean environment variables", function() {

      var vars = [ 'PROBEDOCK_PUBLISH', 'PROBEDOCK_PRINT_PAYLOAD', 'PROBEDOCK_SAVE_PAYLOAD' ],
          booleanValues = [
            {
              expectedValue: true,
              strings: [ '1', 'y', 'yes', 't', 'true' ]
            },
            {
              expectedValue: false,
              strings: [ '0', 'n', 'no', 'f', 'false', 'anything' ]
            }
          ];

      _.each(booleanValues, function(booleanValue) {
        _.each(booleanValue.strings, function(bool) {

          _.extend(envMock, _.inject(vars, function(memo, varName) {
            memo[varName] = bool;
            return memo;
          }, {}));

          config.load();
          expect(configData()).toEqual({
            publish: booleanValue.expectedValue,
            project: {},
            payload: {
              print: booleanValue.expectedValue,
              save: booleanValue.expectedValue
            }
          });
        });
      });
    });

    it("should clear the configuration if reloaded", function() {

      files['/home/.probedock/config.yml'] = yaml.safeDump(sampleConfig);
      config.load();
      expect(configData()).toEqual(sampleConfig);

      files = { 'probedock.yml': yaml.safeDump({ publish: false }) };
      config.load();
      expect(configData()).toEqual({
        publish: false,
        project: {},
        payload: {}
      });

      files = {};
      config.load({
        project: {
          apiId: 'foo'
        }
      });
      expect(configData()).toEqual({
        publish: true,
        project: {
          apiId: 'foo'
        },
        payload: {}
      });

      _.extend(envMock, { PROBEDOCK_WORKSPACE: '/tmp' });
      config.load();
      expect(configData()).toEqual({
        publish: true,
        project: {},
        payload: {},
        workspace: '/tmp'
      });
    });

    it("should override the category but merge tags and tickets", function() {

      files['/home/.probedock/config.yml'] = yaml.safeDump({ project: { category: 'cat', tags: [ 'yee', 'haw' ], tickets: [ '100' ] } });

      files['probedock.yml'] = yaml.safeDump({ project: { category: 'dog', tags: [ 'yee' ], tickets: [ '200' ] } });

      config.load({ project: { category: 'camel', tags: [ 'yee', 'haw', 'yay' ], tickets: [ '100', '300' ] } });

      expect(configData()).toEqual({
        publish: true,
        project: {
          category: 'camel',
          tags: [ 'yee', 'haw', 'yay' ],
          tickets: [ '100', '200', '300' ]
        },
        payload: {}
      });
    });

    it("should not load the test run UID from configuration files", function() {
      files['/home/.probedock/config.yml'] = yaml.safeDump(_.extend({}, sampleConfig, { testRunUid: 'yooayedee' }));
      files['probedock.yml'] = yaml.safeDump({ testRunUid: 'yooeyedee' });
      config.load();
      expect(configData()).toEqual(sampleConfig);
    });
  });

  describe("getServerOptions", function() {

    it("should return the options of the selected server", function() {

      var serverOptions = {
        apiUrl: 'http://example.com',
        apiToken: 'foo'
      };

      config.load({ servers: { 'example.com': serverOptions }, server: 'example.com' });
      expect(config.getServerOptions()).toEqual(serverOptions);
    });

    it("should return no options if the configuration is empty", function() {
      config.load();
      expect(config.getServerOptions()).toEqual({});
    });

    it("should return no options if no servers are defined", function() {
      config.load({ server: 'localhost' });
      expect(config.getServerOptions()).toEqual({});
    });

    it("should return no options if the selected server is not defined", function() {
      config.load({ servers: { 'example.com': { apiUrl: 'http://example.com' } }, server: 'localhost' });
      expect(config.getServerOptions()).toEqual({});
    });
  });

  describe("getProjectOptions", function() {

    var projectOptions;
    beforeEach(function() {
      projectOptions = {
        apiId: 'foo',
        version: '1.0.0',
        category: 'cat',
        tags: [ 'yee', 'haw' ],
        tickets: [ '100', '200', '300' ]
      };
    });

    it("should return the project options", function() {
      config.load({ project: projectOptions });
      expect(config.getProjectOptions()).toEqual(projectOptions);
    });

    it("should override the project API ID with the one of the selected server", function() {
      config.load({ project: projectOptions, servers: { localhost: { projectApiId: 'bar' } }, server: 'localhost' });
      expect(config.getProjectOptions()).toEqual(_.extend(projectOptions, { apiId: 'bar' }));
    });

    it("should return no options if the configuration is empty", function() {
      config.load();
      expect(config.getProjectOptions()).toEqual({});
    });
  });

  describe("validate", function() {

    var errors;
    beforeEach(function() {
      errors = [];
    });

    function validate(customConfig) {
      config.load(customConfig || sampleConfig);
      config.validate(errors);
    }

    it("should add no errors if the configuration is valid", function() {
      validate();
      expect(errors).toEqual([]);
    });

    it("should add an error if the project configuration file set by the PROBEDOCK_CONFIG environment variable doesn't exist", function() {
      _.extend(envMock, { PROBEDOCK_CONFIG: 'foo' });
      validate();
      expect(errors).toEqual([ 'No project configuration file found at foo (set with $PROBEDOCK_CONFIG environment variable)' ]);
    });

    it("should add an error if the project API ID is missing", function() {
      delete sampleConfig.project.apiId;
      validate();
      expect(errors).toEqual([ 'Project API ID is not set (set "project.apiId" in configuration file)' ]);
    });

    it("should add an error if the project version is missing", function() {
      delete sampleConfig.project.version;
      validate();
      expect(errors).toEqual([ 'Project version is not set (set "project.version" in configuration file)' ]);
    });

    it("should add errors if the project options are missing", function() {
      delete sampleConfig.project;
      validate();
      expect(errors).toEqual([
        'Project API ID is not set (set "project.apiId" in configuration file)',
        'Project version is not set (set "project.version" in configuration file)'
      ]);
    });

    it("should add errors if the project option is not an object", function() {
      validate(_.extend(sampleConfig, { project: false }));
      expect(errors).toEqual([
        'Project is not configured (set "project.apiId" and "project.version" in configuration file)'
      ]);
    });

    it("should add an error if no server is configured", function() {
      delete sampleConfig.servers;
      validate();
      expect(errors).toEqual([ 'No Probe Dock Center server is configured (set "servers" in configuration file)' ]);
    });

    it("should add an error if the servers option is not an object", function() {
      validate(_.extend(sampleConfig, { servers: false }));
      expect(errors).toEqual([ 'No Probe Dock Center server is configured (set "servers" in configuration file)' ]);
    });

    it("should add an error if a server is missing the API URL", function() {
      delete sampleConfig.servers.localhost.apiUrl;
      validate();
      expect(errors).toEqual([ 'No API URL is set for Probe Dock Center server localhost (set "servers.localhost.apiUrl" in configuration file)' ]);
    });

    it("should add an error if a server is missing the API key ID", function() {
      delete sampleConfig.servers['example.com'].apiToken;
      validate();
      expect(errors).toEqual([ 'No API authentication token is set for Probe Dock Center server example.com (set "servers.example.com.apiToken" in configuration file)' ]);
    });

    it("should add errors if multiple servers are invalid", function() {
      delete sampleConfig.servers.localhost.apiUrl;
      delete sampleConfig.servers.localhost.apiToken;
      delete sampleConfig.servers['example.com'].apiToken;
      validate();
      expect(errors).toEqual([
        'No API URL is set for Probe Dock Center server localhost (set "servers.localhost.apiUrl" in configuration file)',
        'No API authentication token is set for Probe Dock Center server localhost (set "servers.localhost.apiToken" in configuration file)',
        'No API authentication token is set for Probe Dock Center server example.com (set "servers.example.com.apiToken" in configuration file)'
      ]);
    });

    it("should add errors if the configuration is empty", function() {
      validate({});
      expect(errors).toEqual([
        'Project API ID is not set (set "project.apiId" in configuration file)',
        'Project version is not set (set "project.version" in configuration file)',
        'No Probe Dock Center server is configured (set "servers" in configuration file)'
      ]);
    });
  });
});
