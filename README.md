# Grimoire.js

Grimoire is a lightweight JavaScript library that helps you to build dynamic forms. With simple rule declarations, you can tie the visibility of any DOM element to the state of the inputs on your page. Forms can show the elements that are relevant to the user's current selections, and hide any that are not.

## Why would I use this?

A good user interface guides the user by showing only relevant content. If you're building a form that can have multiple outcomes &mdash; like a wizard interface &mdash; you may need to show or hide sections based upon the user's selections. Checking a box or leaving a text input empty might trigger a warning message. More complex combinations of inputs might trigger the appearance of extra fields.

Simple dynamic forms can be handled with a few event handlers. As they grow, though, the handling code can become more complex and confusing. With Grimoire, you can declare a few rules at the top of your code and know that they'll be followed — that means cleaner code for you and your collaborators.

You can view a couple live examples [here](https://andrewimm.github.io/grimoire/examples).

## What does it look like?

Grimoire exposes its rule declaration through a few methods. Quite simply, you can dictate which values of input elements will make a DOM element visible.

```js
// Initialize Grimoire, attaching its event listeners to the document
var G = new Grimoire();

// When #new_user is checked and #dont_send_spam is unchecked, show #email_input
G.whenChecked(document.getElementById('new_user'))
  .whenUnchecked(document.getElementById('dont_send_spam'))
  .reveal(document.getElementById('email_input'));

// Show #other when the radio buttons named 'relation' are set to 'other'
G.whenValue('relation', 'other').reveal(document.getElementById('other'));
```

## How do I use it?

A Grimoire instance lets you build chains of rules that assess the state of inputs in the DOM. Each piece tests the value or state of an input, and individual tests can be chained together to create more restrictive cases. Once a rule chain has been constructed, it can then be tied to the appearance of an element. When every piece of the rule chain evaluates to true, that element will be shown; otherwise, that element will be hidden. We refer to this controlled element as a toggle.

You can use a single rule to control multiple elements; when it's true, all of those toggles will be shown. Similarly, you can attach multiple rules to a single toggle element. When a toggle element has multiple rule chains, only one of those chains needs to be true for the element to be visible. This allows you to establish exclusive cases for showing an element.

```js
var myToggle = document.getElementById('myToggle');

var G = new Grimoire();
G.whenValue('someInput', 'someValue').reveal(myToggle);
G.whenValue('anotherInput', 'anotherValue').reveal(myToggle);
// myToggle will be visible when the element with the name 'someInput' has a value 'someValue',
// OR when the element with the name 'anotherInput' has a value of 'anotherValue'
```

By default, Grimoire attaches its event listeners to the `document`. You can limit the scope by supplying a top level element to the `Grimoire` constructor instead.

```js
// Only listen to change events within #form
var G = new Grimoire(document.getElementById('form'));
```

When writing rules, there are three types of checks: you can test the state of a checkbox or radio button with `whenChecked` and `whenUnchecked`, or you can test the value of any input with `whenValue`.

To tie a rule chain to the state of a DOM element, use a rule's `.reveal(el)` method. This will establish the invariant that whenever every component of the rule chain is true, the element `el` will be visible.

### Show an element when an input is checked

```js
G.whenChecked(someInput).reveal(myToggle);
```

### Show an element when an input is unchecked

```js
G.whenUnchecked(someInput).reveal(myToggle);
```

### Show an element when multiple inputs are all checked

```js
G.whenChecked([ inputA, inputB, inputC ]).reveal(myToggle);
// OR
G.whenChecked(inputA)
  .whenChecked(inputB)
  .whenChecked(inputC)
  .reveal(myToggle);
// Obviously, one of these is cleaner than the other
```

### Show an element when multiple inputs are all unchecked

```js
// Don't worry, whenUnchecked supports the same syntax
G.whenUnchecked([ inputA, inputB, inputC ]).reveal(myToggle);
// OR
G.whenUnchecked(inputA)
  .whenUnchecked(inputB)
  .whenUnchecked(inputC)
  .reveal(myToggle);
```

### Show an element when an input has a specific value

```js
G.whenValue(someInput, desiredValue).reveal(myToggle);
```

You can also pass a string instead of an input element. This will check the value of the element or elements with name attributes matching that string. This is ideal for checking the value of a set of radio buttons.

```js
// Markup:
// <input type="radio" name="buttons" value="a">
// <input type="radio" name="buttons" value="b">
// <input type="radio" name="buttons" value="c">

G.whenValue('buttons', 'c').reveal(myToggle);
```

### Show an element when an input's value passes some test

Finally, it may be that you don't want to check the input against a single static value. To handle more dynamic cases, you may pass a testing function as the second parameter of `whenValue`. The value of the input will be passed to the function, which should return a *truthy* value to display the toggle, or a *falsy* value to hide it.

```js
// Show myToggle whenever the value of textInput starts with a digit
G.whenValue(textInput, function(value) {
  return !!value.match(/^\d/);
}).reveal(myToggle)
```

### Sharing rules between chains

In practical applications, it's likely that different rule chains will share some tests. You can use the way rules are composed to your advantage here.

Consider a scenario where a checkbox controls the visibility of a text input, and typing anything into that input displays a message. We don't want to have our message appear when the text box is invisible, so it too depends on the checkbox.

```js
// Tie the visibility of `textInput` to the state of `checkbox`
var showForm = G.whenChecked(checkbox);
showForm.reveal(textInput);

// Using showForm as a starting point, we can create a more restrictive rule
// for showing the `message` element
showForm.whenValue(textInput, function(val) {
  return val.length;
}).reveal(message);
```

Not only does this save you from potential repetition, it's actually more performant &mdash; the shared pieces of the chain will only be evaluated once, no matter how many rules build upon them.

A full implementation of a similar scenario is provided as the first example [here](https://andrewimm.github.io/grimoire/examples).

### Perform a check anytime

Once Grimoire is initialized, it will watch for all `change` and `input` events, and update your UI accordingly. However, if at any point you wish to force a UI update (for instance, if you ever update an input programmatically), you may do so with `check()`.

```js
// This doesn't fire a change event
someInput.checked = true;
// Force Grimoire to update
G.check();
```
