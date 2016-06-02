var _ = require('underscore'),
    q = require('q');

module.exports = function(request) {
  return function(options) {
    return q(options).then(buildOptions).then(makeRequest);
  };

  function buildOptions(options) {
    if (options.url) {
      throw new Error('The target URL must not be given directly, but separately as the "apiUrl" and "path" options');
    } else if (!options.path) {
      throw new Error('The path to the Probe Dock API resource must be given as the "path" option');
    } else if (!options.apiUrl) {
      throw new Error('The root of the Probe Dock API must be given as the "apiUrl" option');
    } else if (!options.apiToken) {
      throw new Error('The Probe Dock API authentication token must be given as the "apiToken" option');
    }

    return _.clone(options);
  }

  function makeRequest(options) {

    options.url = options.apiUrl.replace(/\/$/, '') + '/' + options.path.replace(/^\//, '');
    delete options.apiUrl;
    delete options.path;

    if (!options.headers) {
      options.headers = {};
    }

    if (!options.headers.Authorization) {
      options.headers.Authorization = 'Bearer ' + options.apiToken;
    }

    delete options.apiToken;

    var deferred = q.defer();
    request(options, function(err, res) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(res);
      }
    });

    return deferred.promise;
  }
};

module.exports['@require'] = [ 'request' ];
module.exports['@singleton'] = true;
