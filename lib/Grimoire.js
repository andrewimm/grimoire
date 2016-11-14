var Rule = require('./Rule');

/**
 * Grimoire exposes the top-level interface for the library. It will attach its
 * event handlers to the document, unless you provide an element argument to
 * limit its scope
 */
function Grimoire(topLevel) {
  // _topLevel is where we place the 'change' event listener
  this._topLevel = topLevel || document;
  // _triggerMap maps DOM Elements to all toggles they affect
  this._triggerMap = new Grimoire.Map();
  // _nameMap maps Element name attributes to all toggles they affect
  this._nameMap = {};
  // _toggleMap maps toggle elements to the rules that affect their visibility
  this._toggleMap = new Grimoire.Map();

  // Attach the top level event listeners that let this library actually trigger
  // UI changes
  this._topLevel.addEventListener('change', this._onChange.bind(this));
  this._topLevel.addEventListener('input', this._onChange.bind(this));
};
Grimoire.prototype = {
  /**
   * Proxy methods for generating the initial rule in a chain
   */
  whenChecked: function(trigger) {
    var rule = Rule.prototype._checkedInput.call(null, true, trigger);
    rule.context = this;
    return rule;
  },
  whenUnchecked: function(trigger) {
    var rule = Rule.prototype._checkedInput.call(null, false, trigger);
    rule.context = this;
    return rule;
  },
  whenValue: function(trigger, value) {
    var rule = Rule.prototype.whenValue.call(null, trigger, value);
    rule.context = this;
    return rule;
  },

  /**
   * check lets you explicitly evaluate some rules. This can be useful when you
   * programmatically change the value of an input, as this does not fire a DOM
   * event.
   * If you have changed the value of an input element, you can pass it as the
   * only element, and only toggle elements potentially affected by that input
   * will have their visibility tested.
   * Otherwise, the visibility of all toggle elements will be recalculated.
   */
  check: function(trigger) {
    if (trigger) {
      this._onChange({
        target: trigger
      });
      return;
    }
    var knownRules = new Grimoire.Map();
    this._toggleMap.forEach(this._toggleElement.bind(this, knownRules));
  },

  /**
   * Private methods
   */
  _registerNames: function(names, el) {
    for (var i = names.length; i--;) {
      var toggles = this._nameMap[names[i]];
      if (toggles) {
        toggles.push(el);
      } else {
        this._nameMap[names[i]] = [el];
      }
    }
  },

  _registerTriggers: function(triggers, el) {
    for (var i = triggers.length; i--;) {
      var toggles = this._triggerMap.get(triggers[i]);
      if (toggles) {
        toggles.push(el);
      } else {
        this._triggerMap.set(triggers[i], [el]);
      }
    }
  },

  _registerRule: function(toggle, rule) {
    var rules = this._toggleMap.get(toggle);
    if (rules) {
      rules.push(rule);
    } else {
      this._toggleMap.set(toggle, [rule]);
    }
  },

  _toggleSeen: function(el) {
    return !!this._toggleMap.get(el);
  },

  _onChange: function(e) {
    var trigger = e.target;
    // First, we fetch all elements toggled by the trigger element
    var elementToggled = this._triggerMap.get(trigger);
    var nameToggled = trigger.name ? this._nameMap[trigger.name] : null;
    // For each element that might be toggled by this change, we need to fetch
    // a set of rules to test.
    // If the element is currently hidden, we theoretically only need to test
    // the rules containing the toggle element. However, in practice the memory
    // and computation overhead associated with storing that extra data does
    // not provide any real benefit, especially since each toggle will typically
    // have relatively few rule chains associated with it.
    var testMap = new Grimoire.Map();
    var i;
    var toggle;
    if (elementToggled) {
      for (i = elementToggled.length; i--;) {
        toggle = elementToggled[i];
        if (!testMap.get(toggle)) {
          testMap.set(toggle, this._toggleMap.get(toggle));
        }
      }
    }
    if (nameToggled) {
      for (i = nameToggled.length; i--;) {
        toggle = nameToggled[i];
        if (!testMap.get(toggle)) {
          testMap.set(toggle, this._toggleMap.get(toggle));
        }
      }
    }
    // Now we check the total set of rules for each element. The first time one
    // evaluates to true, we know to display the element ignore the rest.
    var knownRules = new Grimoire.Map();
    testMap.forEach(this._toggleElement.bind(this, knownRules));
  },

  /**
   * Test all rules that determine the visibility of a toggle element. If any
   * one of them is true, display it. If all rules are invalid, hide the toggle.
   */
  _toggleElement: function(knownRules, rules, toggle) {
    var shouldShow = false;
    for (var i = rules.length; i--;) {
      shouldShow = shouldShow || this._testRule(knownRules, rules[i]);
      if (shouldShow) {
        toggle.style.display = 'block';
        return;
      }
    }
    toggle.style.display = 'none';
  },

  /**
   * Memoized test of a single rule. It recurses down the base of the chain, and
   * stores results as it comes back up the stack.
   */
  _testRule: function(knownRules, rule) {
    var knownResult = knownRules.get(rule);
    if (typeof knownResult === 'boolean') {
      // We've already tested this rule
      return knownResult;
    }
    var shouldShow = rule._test();
    if (rule.prev) {
      shouldShow = shouldShow && this._testRule(knownRules, rule.prev);
    }
    knownRules.set(rule, shouldShow);
    return shouldShow;
  }
};

Grimoire.Map = window.Map;
if (!window.Map || !window.Map.prototype.hasOwnProperty('forEach') || __FORCE_POLYFILL__) {
  // If the ES6 Map is not supported, we need to mock out a basic version.
  // Thankfully we only need to support a couple specific use cases -- storing
  // Elements as keys, and iterating with forEach -- so we can take shortcuts

  var elementIndex = {};

  Grimoire.Map = function() {
    this.entries = []; // An array of [key, value] arrays
    this.entryIndex = {}; // A mapping of string keys to row #s in this.entries
  };
  Grimoire.Map.prototype = {
    set: function(key, value) {
      var lookup = key.__MAP_LOOKUP;
      if (!lookup) {
        do {
          lookup = Number(new Date());
        } while (elementIndex[lookup]);
        key.__MAP_LOOKUP = lookup;
        elementIndex[lookup] = key;
      } else {
        // The key can only be in our Map if it already has a lookup property
        var row = this.entryIndex[lookup];
        if (typeof row === 'number') {
          this.entries[row][1] = value;
          return this;
        }
      }

      var len = this.entries.length;
      this.entries[len] = [key, value];
      this.entryIndex[lookup] = len;
      return this;
    },

    get: function(key) {
      var lookup = key.__MAP_LOOKUP;
      if (!lookup) {
        return void(0);
      }
      var row = this.entryIndex[lookup];
      if (typeof row === 'number') {
        return this.entries[row][1];
      }
      return void(0);
    },

    forEach: function(cb, thisarg) {
      for (var i = 0, len = this.entries.length; i < len; i++) {
        cb.call(thisarg || void(0), this.entries[i][1], this.entries[i][0], this);
      }
    }
  };
}

module.exports = Grimoire;
