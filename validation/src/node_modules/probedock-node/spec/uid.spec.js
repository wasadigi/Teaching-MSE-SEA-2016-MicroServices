var factory = require('../lib/uid');

describe('uid', function() {

  var files, fsMock, uid;
  beforeEach(function() {

    files = {};
    fsMock = {
      existsSync: function(path) {
        return !!files[path];
      },
      readFileSync: function(path) {
        return files[path];
      }
    };

    uid = factory(fsMock);
  });

  describe("load", function() {

    function loadUid(config) {
      return uid.load(config || {});
    }

    it("should return null if no UID is defined", function() {
      expect(loadUid()).toBe(null);
    });

    it("should return null if no UID is saved in the workspace", function() {
      expect(loadUid({ workspace: '/tmp' })).toBe(null);
    });

    it("should load the UID from the workspace", function() {
      files['/tmp/uid'] = 'foo';
      expect(loadUid({ workspace: '/tmp' })).toEqual('foo');
    });

    it("should only load the first line of the UID file", function() {
      files['/tmp/uid'] = "baz\nbar\nfoo";
      expect(loadUid({ workspace: '/tmp' })).toEqual('baz');
    });

    it("should load the UID from the configuration", function() {
      expect(loadUid({ testRunUid: 'yooayedee' })).toEqual('yooayedee');
    });

    it("should override the UID from the workspace with the one from the configuration", function() {
      files['/tmp/uid'] = 'yooayedee';
      expect(loadUid({ testRunUid: 'yooeyedee' })).toEqual('yooeyedee');
    });
  });
});
