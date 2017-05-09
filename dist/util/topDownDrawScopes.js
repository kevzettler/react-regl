"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _batchChildren = require("./batchChildren.js");

var _batchChildren2 = _interopRequireDefault(_batchChildren);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var topDownDrawScopes = function topDownDrawScopes(node) {
  if (!node) {
    return function () {};
  }

  if (!node.children && node.data.drawCommand) {
    return function () {
      node.data.drawCommand(node.data);
    };
  }

  if (node.children) {
    var children = (0, _batchChildren2.default)(node.children);

    if (node.data.drawCommand) {
      return function () {
        node.data.drawCommand(node.data, function () {
          children.forEach(function (child) {
            topDownDrawScopes(child)();
          });
        });
      };
    }

    if (!node.data.drawCommand) {
      return function () {
        children.forEach(function (child) {
          topDownDrawScopes(child)();
        });
      };
    }
  }

  return function () {};
};

exports.default = topDownDrawScopes;