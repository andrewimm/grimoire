jest
  .dontMock('../grimoire')
  .dontMock('fs')
  .dontMock('path');

__FORCE_POLYFILL__ = false;

describe('Grimoire', function() {
  var Grimoire = require('../grimoire');
  var path = require('path');
  // Setup
  var html = require('fs').readFileSync(path.join(__dirname, 'test_document.html')).toString();
  document.documentElement.innerHTML = html;

  var inputs = document.getElementsByTagName('input');

  // We need to programmatically fire 'change' and 'input' events
  var fireChange = function(el) {
    var ev = document.createEvent('UIEvent');
    ev.initEvent('change', true, true);
    el.dispatchEvent(ev);
  };
  var fireInput = function(el) {
    var ev = document.createEvent('UIEvent');
    ev.initEvent('input', true, true);
    el.dispatchEvent(ev);
  };

  var G = new Grimoire();
  var toggle = document.getElementById('toggled');
  G.whenValue('radio', 'a').reveal(toggle);
  G.whenValue('radio', 'c').whenChecked(document.getElementById('check')).reveal(toggle);
  G.whenValue('text', 'parse').reveal(toggle);
  G.whenValue(document.getElementById('other_text'), 'parse').reveal(toggle);
  G.whenChecked([document.getElementById('check_one'), document.getElementById('check_two')]).reveal(toggle);
  G.whenChecked(document.getElementById('check_three')).whenUnchecked(document.getElementById('check_four')).reveal(toggle);
  G.whenValue(document.getElementById('cost'), function(val) {
    // Only valid when the value begins with a $
    return !!val.match(/^\$/);
  }).reveal(toggle);

  afterEach(function() {
    // Clean up
    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i].type === 'radio' || inputs[i].type === 'checkbox') {
        inputs[i].checked = false;
      } else if (inputs[i].type === 'text') {
        inputs[i].value = '';
      }
    }
  });

  it('checks an element by name', function() {
    G.check();
    expect(toggle.style.display).toBe('none');

    var text = document.getElementsByName('text')[0];
    text.value = 'parse';
    fireChange(text);
    expect(toggle.style.display).toBe('block');
  });

  it('checks an element by id', function() {
    G.check();
    expect(toggle.style.display).toBe('none');

    var otherText = document.getElementById('other_text');
    otherText.value = 'parse';
    fireChange(otherText);
    expect(toggle.style.display).toBe('block');
  });

  it('checks a changing text input', function() {
    G.check();
    expect(toggle.style.display).toBe('none');

    var otherText = document.getElementById('other_text');
    otherText.value = 'parse';
    fireInput(otherText);
    expect(toggle.style.display).toBe('block');
  });

  it('handles a checked checkbox element', function() {
    G.check();
    expect(toggle.style.display).toBe('none');

    document.getElementsByName('radio')[2].checked = true;
    var check = document.getElementById('check');
    check.checked = true;
    fireChange(check);
    expect(toggle.style.display).toBe('block');
  });

  it('properly evaluates a chain of rules', function() {
    G.check();
    expect(toggle.style.display).toBe('none');

    var c = document.getElementsByName('radio')[2];
    c.checked = true;
    fireChange(c);
    expect(toggle.style.display).toBe('none');

    var check = document.getElementById('check');
    check.checked = true;
    fireChange(check);
    expect(toggle.style.display).toBe('block');

    c.checked = false;
    fireChange(c);
    expect(toggle.style.display).toBe('none');
  });

  it('handles an unchecked checkbox element', function() {
    G.check();
    expect(toggle.style.display).toBe('none');

    var three = document.getElementById('check_three');
    var four = document.getElementById('check_four');
    four.checked = true;
    fireChange(four);
    expect(toggle.style.display).toBe('none');
    three.checked = true;
    fireChange(three);
    expect(toggle.style.display).toBe('none');
    four.checked = false;
    fireChange(four);
    expect(toggle.style.display).toBe('block');
  });

  it('checks an array of checkbox elements', function() {
    G.check();
    expect(toggle.style.display).toBe('none');

    var one = document.getElementById('check_one');
    one.checked = true;
    fireChange(one);
    expect(toggle.style.display).toBe('none');
    var two = document.getElementById('check_two');
    two.checked = true;
    fireChange(two);
    expect(toggle.style.display).toBe('block');
  });

  it('checks a set of radio buttons by name', function() {
    G.check();
    expect(toggle.style.display).toBe('none');

    var a = document.getElementsByName('radio')[0];
    a.checked = true;
    fireChange(a);
    expect(toggle.style.display).toBe('block');
  });

  it('returns to hiding when a rule is no longer valid', function() {
    G.check();
    expect(toggle.style.display).toBe('none');

    var a = document.getElementsByName('radio')[0];
    a.checked = true;
    fireChange(a);
    expect(toggle.style.display).toBe('block');

    a.checked = false;
    fireChange(a);
    expect(toggle.style.display).toBe('none');
  });

  it('displays an element when multiple rules are valid', function() {
    G.check();
    expect(toggle.style.display).toBe('none');

    var a = document.getElementsByName('radio')[0];
    a.checked = true;
    fireChange(a);
    expect(toggle.style.display).toBe('block');

    var text = document.getElementById('other_text');
    text.value = 'parse';
    fireChange(text);
    expect(toggle.style.display).toBe('block');

    a.checked = false;
    fireChange(a);
    expect(toggle.style.display).toBe('block');

    text.value = '';
    fireChange(text);
    expect(toggle.style.display).toBe('none');
  });

  it('can evaluate inputs with a function', function() {
    G.check();
    expect(toggle.style.display).toBe('none');

    var cost = document.getElementById('cost');
    cost.value = '$12.40';
    fireInput(cost);
    expect(toggle.style.display).toBe('block');

    cost.value = 'not a dollar amount';
    fireInput(cost);
    expect(toggle.style.display).toBe('none');
  });

  it('should throw on an invalid trigger', function() {
    var nonexistent = document.getElementById('nonexistent');
    expect(G.whenValue.bind(G, nonexistent, '')).toThrow();
  });
});
