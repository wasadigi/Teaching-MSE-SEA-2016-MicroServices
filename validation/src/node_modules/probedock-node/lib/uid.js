var path = require('path');

module.exports = function(fs) {

  return {
    load: function(config) {

      if (config.testRunUid) {
        return config.testRunUid;
      } else if (!config.workspace) {
        return null;
      }

      var uidFile = path.join(config.workspace, 'uid');
      return fs.existsSync(uidFile) ? fs.readFileSync(uidFile, { encoding: 'utf8' }).split('\n')[0] : null;
    }
  };
};

module.exports['@require'] = [ 'fs' ];
module.exports['@singleton'] = true;
