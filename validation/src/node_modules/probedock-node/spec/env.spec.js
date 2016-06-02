var factory = require('../lib/env');

describe('env', function() {

  var env;
  beforeEach(function() {
    env = factory();
  });

  it("should be the environment of the process", function() {
    expect(env).toBe(process.env);
  });
});
