__FORCE_POLYFILL__ = true;

jest.dontMock('../grimoire');
describe('MapPolyfill', function() {
  var MapPolyfill = require('../grimoire').Map;

  it('returns undefined when it doesn\'t contain a key', function() {
    var map = new MapPolyfill();
    expect(map.get({})).toBe(undefined);
  });

  it('assigns a lookup index to an object key', function() {
    var map = new MapPolyfill();
    var key = {};
    expect(key.__MAP_LOOKUP).toBe(undefined);
    map.set(key, 5);
    expect(key.__MAP_LOOKUP).not.toBe(undefined);
  });

  it('can retrieve a key-value pair that was previously set', function() {
    var map = new MapPolyfill();
    var a = {};
    var b = {};
    map.set(a, 'Alpha');
    map.set(b, 'Beta');
    expect(map.get(a)).toBe('Alpha');
    expect(map.get(b)).toBe('Beta');
  });

  it('can overwrite an existing key-value pair', function() {
    var map = new MapPolyfill();
    var key = {};
    map.set(key, 'first');
    map.set(key, 'second');
    expect(map.get(key)).toBe('second');
  });

  it('can iterate over all stored key-value pairs', function() {
    var map = new MapPolyfill();
    var a = {};
    var b = {};
    var c = {};
    map.set(a, 'a');
    map.set(b, 'b');
    map.set(c, 'c');
    var reverse = {
      a: a,
      b: b,
      c: c
    };
    map.forEach(function(value, key) {
      expect(reverse[value]).toBe(key);
      delete reverse[value];
    });
    expect(Object.keys(reverse).length).toBe(0);
  });
});
