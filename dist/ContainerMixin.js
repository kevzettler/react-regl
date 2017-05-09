'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _ReactMultiChild = require('react-dom/lib/ReactMultiChild');

var _ReactMultiChild2 = _interopRequireDefault(_ReactMultiChild);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function injectAfter(parentNode, referenceNode, node) {
  /* if (referenceNode === null) {
   *   parentNode.insertFirst(node);
   * } else {
   *   parentNode.insertAfter(referenceNode, node);
   * }*/
}

var ContainerMixin = {
  moveChild: function moveChild(child, afterNode, toIndex, lastIndex) {
    var childNode = child._mountImage;
    injectAfter(this.node, afterNode, childNode);
  },
  createChild: function createChild(child, afterNode, childNode) {
    child._mountImage = childNode;
    injectAfter(this.node, afterNode, childNode);
  },
  removeChild: function removeChild(child) {
    var childNode = child._mountImage;
    child._mountImage = null;
    this.node.remove(childNode);
  },
  updateChildrenAtRoot: function updateChildrenAtRoot(nextChildren, transaction) {
    this.updateChildren(nextChildren, transaction, {});
  },
  mountAndInjectChildrenAtRoot: function mountAndInjectChildrenAtRoot(children, transaction) {
    this.mountAndInjectChildren(children, transaction, {});
  },
  updateChildren: function updateChildren(nextChildren, transaction, context) {
    this._updateChildren(nextChildren, transaction, context);
  },
  mountAndInjectChildren: function mountAndInjectChildren(children, transaction, context) {
    var mountedImages = this.mountChildren(children, transaction, context);

    var i = 0;
    for (var key in this._renderedChildren) {
      if (this._renderedChildren.hasOwnProperty(key)) {
        if (_typeof(mountedImages[i]) === 'object') {
          var child = this._renderedChildren[key];
          child._mountImage = mountedImages[i];
          this.node.add(mountedImages);
        }
        i++;
      }
    }
  }
};

exports.default = Object.assign(_ReactMultiChild2.default.Mixin, ContainerMixin);