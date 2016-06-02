var ioc = require('electrolyte');

ioc.loader(ioc.node(__dirname));

ioc.loader(function(id) {
  if (id.match(/^\./)) {
    return undefined;
  }

  try {
    var dep = require(id);
    return function() {
      return dep;
    };
  } catch (e) {
    return undefined;
  }
});

module.exports = ioc;
