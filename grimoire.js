/**
 * Grimoire.js
 * Version 1.0.0
 * https://github.com/andrewimm/grimoire
 */

var Grimoire=function(e){function t(r){if(n[r])return n[r].exports;var i=n[r]={exports:{},id:r,loaded:!1};return e[r].call(i.exports,i,i.exports,t),i.loaded=!0,i.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t,n){function r(e){this._topLevel=e||document,this._triggerMap=new r.Map,this._nameMap={},this._toggleMap=new r.Map,this._topLevel.addEventListener("change",this._onChange.bind(this)),this._topLevel.addEventListener("input",this._onChange.bind(this))}var i=n(1);if(r.prototype={whenChecked:function(e){var t=i.prototype._checkedInput.call(null,!0,e);return t.context=this,t},whenUnchecked:function(e){var t=i.prototype._checkedInput.call(null,!1,e);return t.context=this,t},whenValue:function(e,t){var n=i.prototype.whenValue.call(null,e,t);return n.context=this,n},check:function(e){if(e)return void this._onChange({target:e});var t=new r.Map;this._toggleMap.forEach(this._toggleElement.bind(this,t))},_registerNames:function(e,t){for(var n=e.length;n--;){var r=this._nameMap[e[n]];r?r.push(t):this._nameMap[e[n]]=[t]}},_registerTriggers:function(e,t){for(var n=e.length;n--;){var r=this._triggerMap.get(e[n]);r?r.push(t):this._triggerMap.set(e[n],[t])}},_registerRule:function(e,t){var n=this._toggleMap.get(e);n?n.push(t):this._toggleMap.set(e,[t])},_toggleSeen:function(e){return!!this._toggleMap.get(e)},_onChange:function(e){var t,n,i=e.target,s=this._triggerMap.get(i),o=i.name?this._nameMap[i.name]:null,h=new r.Map;if(s)for(t=s.length;t--;)n=s[t],h.get(n)||h.set(n,this._toggleMap.get(n));if(o)for(t=o.length;t--;)n=o[t],h.get(n)||h.set(n,this._toggleMap.get(n));var a=new r.Map;h.forEach(this._toggleElement.bind(this,a))},_toggleElement:function(e,t,n){for(var r=!1,i=t.length;i--;)if(r=r||this._testRule(e,t[i]))return void(n.style.display="block");n.style.display="none"},_testRule:function(e,t){var n=e.get(t);if("boolean"==typeof n)return n;var r=t._test();return t.prev&&(r=r&&this._testRule(e,t.prev)),e.set(t,r),r}},r.Map=window.Map,!window.Map||!window.Map.prototype.hasOwnProperty("forEach")){var s={};r.Map=function(){this.entries=[],this.entryIndex={}},r.Map.prototype={set:function(e,t){var n=e.__MAP_LOOKUP;if(n){var r=this.entryIndex[n];if("number"==typeof r)return this.entries[r][1]=t,this}else{do n=Number(new Date);while(s[n]);e.__MAP_LOOKUP=n,s[n]=e}var i=this.entries.length;return this.entries[i]=[e,t],this.entryIndex[n]=i,this},get:function(e){var t=e.__MAP_LOOKUP;if(t){var n=this.entryIndex[t];return"number"==typeof n?this.entries[n][1]:void 0}},forEach:function(e,t){for(var n=0,r=this.entries.length;n<r;n++)e.call(t||void 0,this.entries[n][1],this.entries[n][0],this)}}}e.exports=r},function(e,t,n){function r(e,t){this.prev=e,this.props=t,this.context=null}var i=n(2);r.prototype={whenChecked:function(e){return this._checkedInput(!0,e)},whenUnchecked:function(e){return this._checkedInput(!1,e)},_checkedInput:function(e,t){var n={checked:e};if(Array.isArray(t)){for(var i=t.length;i--;)if(!t[i]||1!==t[i].nodeType)throw new TypeError("You can only test the checked state of Elements")}else if(!t||1!==t.nodeType)throw new TypeError("You can only test the checked state of Elements");return n.el=t,new r(this instanceof r?this:null,n)},whenValue:function(e,t){var n={};if("function"==typeof t?n.fn=t:n.value=t,"string"==typeof e)n.name=e;else{if(!e||1!==e.nodeType)throw new TypeError("Invalid trigger type. Expected string or Element");n.el=e}return new r(this instanceof r?this:null,n)},_test:function(){if(this.props.hasOwnProperty("checked")){if(Array.isArray(this.props.el)){for(var e=this.props.el.length;e--;)if(this.props.el[e].checked!==this.props.checked)return!1;return!0}return this.props.el.checked===this.props.checked}var t;if(this.props.hasOwnProperty("el"))t=this.props.el.value||"";else if(this.props.hasOwnProperty("name")){var n=document.getElementsByName(this.props.name);if(n.length<1)return!1;if("radio"===n[0].type){for(var r=n.length;r--;)if(n[r].checked){t=n[r].value;break}}else t=n[0].value}if(this.props.hasOwnProperty("fn")){if(!this.props.fn(t))return!1}else if(this.props.value!==t)return!1;return!0},_testChain:function(){for(var e=this,t=!0;e&&(t=t&&e._test());)e=e.prev;return t},reveal:function(e){for(var t,n=this,r=[],s=[];n;)n.props.hasOwnProperty("name")?s.push(n.props.name):Array.isArray(n.props.el)?r=r.concat(n.props.el):r.push(n.props.el),n.context&&(t=n.context),n=n.prev;var o="none"===i(e)||!t._toggleSeen(e);s.length&&t._registerNames(s,e),r.length&&t._registerTriggers(r,e),t._registerRule(e,this),o&&(e.style.display=this._testChain()?"block":"none")}},e.exports=r},function(e,t){function n(e){return e.currentStyle?e.currentStyle.display:window.getComputedStyle?document.defaultView.getComputedStyle(e,null).getPropertyValue("display"):null}e.exports=n}]);