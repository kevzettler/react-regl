"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
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
    var children = batchChildren(node.children);

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