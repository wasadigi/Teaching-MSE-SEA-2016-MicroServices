var _ = require('underscore'),
    q = require('q');

module.exports = function(api) {

  return {
    upload: function(payload, options) {
      return q({ payload: payload, options: options })
        .then(buildOptions)
        .then(api)
        .then(checkResponse);
    }
  };

  function buildOptions(data) {

    var requestOptions = _.pick(data.options, 'apiUrl', 'apiToken'),
        serializedPayload = JSON.stringify(data.payload);

    return _.extend(requestOptions, {
      path: '/publish',
      method: 'POST',
      body: serializedPayload,
      headers: {
        'Content-Type': 'application/vnd.probedock.payload.v1+json',
        'Content-Length': serializedPayload.length,
      }
    });
  }

  function checkResponse(res) {
    if (res.statusCode !== 202) {
      throw new Error('Server responded with unexpected status code ' + res.statusCode + ' (response: ' + res.body + ')');
    }
  }
};

module.exports['@require'] = [ 'api' ];
module.exports['@singleton'] = true;
