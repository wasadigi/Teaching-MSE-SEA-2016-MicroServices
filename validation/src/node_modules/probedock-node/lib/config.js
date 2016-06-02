var _ = require('underscore'),
    merge = require('deepmerge'),
    path = require('path'),
    yaml = require('js-yaml');

module.exports = function(env, fs) {

  function addEnvVar(config, name, value, processor) {
    if (value !== undefined) {
      config[name] = processor ? processor(value) : value;
    }
  }

  function parseBooleanEnvVar(value) {
    return !!value.match(/^(?:1|t|true|y|yes)$/);
  }

  function Config(config) {
    _.extend(this, _.pick(config || {}, 'payload', 'project', 'publish', 'server', 'servers', 'testRunUid', 'workspace'));
  }

  function clear(config) {
    for (var name in config) {
      delete config[name];
    }
  }

  _.extend(Config.prototype, {

    load: function(customConfig) {
      clear(this);

      var configFiles = [
        path.join(env.HOME, '.probedock', 'config.yml'),
        env.PROBEDOCK_CONFIG || 'probedock.yml'
      ];

      // TODO: log warning if yaml is invalid
      var config = _.reduce(configFiles, function(memo, path) {
        if (fs.existsSync(path)) {
          memo = merge(memo, yaml.safeLoad(fs.readFileSync(path, { encoding: 'utf-8' })));
        }
        return memo;
      }, { publish: true, project: {}, payload: {} });

      delete config.testRunUid;

      if (customConfig) {
        config = merge(config, customConfig);
      }

      var envConfig = {
        payload: {}
      };

      addEnvVar(envConfig, 'publish', env.PROBEDOCK_PUBLISH, parseBooleanEnvVar);
      addEnvVar(envConfig, 'server', env.PROBEDOCK_SERVER);
      addEnvVar(envConfig, 'workspace', env.PROBEDOCK_WORKSPACE);
      addEnvVar(envConfig.payload, 'print', env.PROBEDOCK_PRINT_PAYLOAD, parseBooleanEnvVar);
      addEnvVar(envConfig.payload, 'save', env.PROBEDOCK_SAVE_PAYLOAD, parseBooleanEnvVar);
      addEnvVar(envConfig, 'testRunUid', env.PROBEDOCK_TEST_REPORT_UID);

      config = merge(config, envConfig);

      _.extend(this, config);
    },

    getServerOptions: function() {
      return _.isObject(this.servers) ? this.servers[this.server] || {} : {};
    },

    getProjectOptions: function() {

      var options = {};

      if (_.isObject(this.project)) {
        _.extend(options, _.pick(this.project, 'apiId', 'version', 'category', 'tags', 'tickets'));
      }

      var serverOptions = this.getServerOptions();
      if (serverOptions.projectApiId) {
        options.apiId = serverOptions.projectApiId;
      }

      return options;
    },

    validate: function(errors) {

      if (env.PROBEDOCK_CONFIG && !fs.existsSync(env.PROBEDOCK_CONFIG)) {
        errors.push('No project configuration file found at ' + env.PROBEDOCK_CONFIG + ' (set with $PROBEDOCK_CONFIG environment variable)');
      }

      if (!this.project || !_.isObject(this.project)) {
        errors.push('Project is not configured (set "project.apiId" and "project.version" in configuration file)');
      } else {
        if (!this.project.apiId) {
          errors.push('Project API ID is not set (set "project.apiId" in configuration file)');
        }
        if (!this.project.version) {
          errors.push('Project version is not set (set "project.version" in configuration file)');
        }
      }

      if (!this.servers || !_.isObject(this.servers)) {
        errors.push('No Probe Dock Center server is configured (set "servers" in configuration file)');
      } else {
        _.each(this.servers, function(server, name) {
          if (!server || !server.apiUrl) {
            errors.push('No API URL is set for Probe Dock Center server ' + name + ' (set "servers.' + name + '.apiUrl" in configuration file)');
          }
          if (!server || !server.apiToken) {
            errors.push('No API authentication token is set for Probe Dock Center server ' + name + ' (set "servers.' + name + '.apiToken" in configuration file)');
          }
        });
      }
    }
  });

  return Config;
};

module.exports['@require'] = [ 'env', 'fs' ];
module.exports['@singleton'] = true;
