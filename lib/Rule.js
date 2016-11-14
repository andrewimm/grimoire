var getDisplayStyle = require('./getDisplayStyle');

/**
 * A Rule is a single test of one or more input Elements.
 * They can be chained together to create more complex rules.
 * Calling .reveal(el) on a chain of rules will tie that chain of rules to the
 * visibility of the provided element.
 */

function Rule(prev, props) {
  this.prev = prev;
  this.props = props;
  this.context = null;
}
Rule.prototype = {

  /**
   * Methods for extending a rule chain with another case:
   */

  /**
   * whenChecked evaluates to true when an input (or set of inputs) is checked
   */
  whenChecked: function(trigger) {
    return this._checkedInput(true, trigger);
  },

  /**
   * whenUnchecked evaluates to true when an input (or set of inputs) is not
   * checked
   */
  whenUnchecked: function(trigger) {
    return this._checkedInput(false, trigger);
  },

  /**
   * The actual logic for establishing a rule that depends on checked state
   * It will throw a TypeError if it is told to check something other than
   * a DOM Element
   */
  _checkedInput: function(isChecked, trigger) {
    var props = {
      checked: isChecked
    };
    if (Array.isArray(trigger)) {
      for (var i = trigger.length; i--;) {
        if (!trigger[i] || trigger[i].nodeType !== 1) {
          throw new TypeError('You can only test the checked state of Elements');
        }
      }
    } else if (!trigger || trigger.nodeType !== 1) {
      throw new TypeError('You can only test the checked state of Elements');
    }
    props.el = trigger;
    return new Rule((this instanceof Rule) ? this : null, props);
  },

  /**
   * whenValue checks the value of an input element.
   * If the first parameter is a string, it will check the value of the inputs
   * with matching name attributes.
   * If the second value is a function, it will be executed on the value of
   * the input and return a truthy or falsy value to determine the validity
   * of this rule.
   */
  whenValue: function(trigger, value) {
    var props = {};
    if (typeof value === 'function') {
      props.fn = value;
    } else {
      props.value = value;
    }
    if (typeof trigger === 'string') {
      props.name = trigger;
    } else if (trigger && trigger.nodeType === 1) {
      props.el = trigger;
    } else {
      throw new TypeError('Invalid trigger type. Expected string or Element');
    }
    return new Rule((this instanceof Rule) ? this : null, props);
  },

  /**
   * Methods for evaluating and testing
   */

  /**
   * Look at the properties of this single rule, and determine if it is valid
   */
  _test: function() {
    if (this.props.hasOwnProperty('checked')) {
      // testing the checked state of el
      if (Array.isArray(this.props.el)) {
        for (var i = this.props.el.length; i--;) {
          if (this.props.el[i].checked !== this.props.checked) {
            return false;
          }
        }
        return true;
      }
      return this.props.el.checked === this.props.checked;
    }

    var val;
    if (this.props.hasOwnProperty('el')) {
      val = this.props.el.value || '';
    } else if (this.props.hasOwnProperty('name')) {
      var elements = document.getElementsByName(this.props.name);
      if (elements.length < 1) {
        // If the element doesn't exist, we can't check its value
        return false;
      }
      if (elements[0].type === 'radio') {
        for (var r = elements.length; r--;) {
          if (elements[r].checked) {
            val = elements[r].value;
            break;
          }
        }
      } else {
        val = elements[0].value;
      }
    }

    if (this.props.hasOwnProperty('fn')) {
      if (!this.props.fn(val)) {
        return false;
      }
    } else {
      if (this.props.value !== val) {
        return false;
      }
    }

    return true;
  },

  /**
   * Evaluate this rule, and all previous rules in the chain. Because this
   * does not memoize, it is only used for the initial check performed when a
   * rule chain is first attached to an element.
   */
  _testChain: function() {
    var rule = this;
    var shouldShow = true;
    while (rule) {
      shouldShow = shouldShow && rule._test();
      if (!shouldShow) {
        break;
      }
      rule = rule.prev;
    }
    return shouldShow;
  },

  /**
   * Finalize the ruleset and assign it to reveal a specific element.
   */
  reveal: function(el) {
    var rule = this;
    var triggerElements = [];
    var triggerNames = [];
    var context;
    while (rule) {
      if (rule.props.hasOwnProperty('name')) {
        triggerNames.push(rule.props.name);
      } else {
        if (Array.isArray(rule.props.el)) {
          triggerElements = triggerElements.concat(rule.props.el);
        } else {
          triggerElements.push(rule.props.el);
        }
      }
      if (rule.context) {
        context = rule.context;
      }
      rule = rule.prev;
    }
    // If we've never seen the toggle element before, or if it's currently
    // hidden, we should test it
    var shouldEvaluate = (getDisplayStyle(el) === 'none') || !context._toggleSeen(el);
    if (triggerNames.length) {
      context._registerNames(triggerNames, el);
    }
    if (triggerElements.length) {
      context._registerTriggers(triggerElements, el);
    }
    context._registerRule(el, this);
    if (shouldEvaluate) {
      el.style.display = this._testChain() ? 'block' : 'none';
    }
  }
};

module.exports = Rule;
