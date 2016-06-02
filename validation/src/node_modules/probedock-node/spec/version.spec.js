describe('version', function() {

  var client = require('../lib');

  it("should be correct", function() {
    expect(client.version).toBe(require('../package').version);
  });
});
