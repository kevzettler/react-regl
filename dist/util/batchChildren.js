"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var batchChildren = function batchChildren(children) {
  if (!children) {
    return [];
  }

  if (children.length === 1) {
    return children;
  }

  return children.reduce(function (accum, child, idx, orgArray) {
    if (child.children) {
      accum["scope-" + idx] = child;
    }

    if (!child.data.drawCommand) {
      accum["scope-nodraw-" + idx] = child;
    }

    if (!child.children && child.data.drawCommand) {
      var key = "" + (child.data.drawCommand && child.data.drawCommand.toString());
      if (!accum[key]) {
        var data = new Array();
        data.drawCommand = child.data.drawCommand;
        accum[key] = {
          data: data
        };
      }

      delete child.data.drawCommand;
      accum[key].data.push(child.data);
    }

    return idx === orgArray.length - 1 && Object.values(accum) || accum;
  }, {});
};

exports.default = batchChildren;