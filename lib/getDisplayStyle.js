/**
 * Cross-browser method to get the current 'display' CSS attribute of a node
 */
function getDisplayStyle(node) {
  if (node.currentStyle) {
    return node.currentStyle.display;
  }
  if (window.getComputedStyle) {
    return document.defaultView.getComputedStyle(node, null).getPropertyValue('display');
  }
  return null;
}

module.exports = getDisplayStyle;
