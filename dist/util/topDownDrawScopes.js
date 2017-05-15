"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _batchChildren = require("./batchChildren.js");

var _batchChildren2 = _interopRequireDefault(_batchChildren);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var topDownDrawScopes = function topDownDrawScopes(node) {
  if (!node) {
    return function () {
      debugger;
    };
  }

  if (!node.children && node.data.drawCommand) {
    return function () {
      node.data.drawCommand(node.data);
    };
  }

  if (node.children) {
    var children = (0, _batchChildren2.default)(node.children);
    var childCommands = children.map(topDownDrawScopes);

    if (node.data.drawCommand) {
      return function () {
        node.data.drawCommand(node.data, function () {
          childCommands.forEach(function (childCommand) {
            childCommand();
          });
        });
      };
    }

    if (!node.data.drawCommand) {
      return function () {
        childCommands.forEach(function (childCommand) {
          childCommand();
        });
      };
    }
  }

  return function () {};
};

exports.default = topDownDrawScopes;