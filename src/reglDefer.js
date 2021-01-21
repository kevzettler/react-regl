import React from 'react';
import defregl from 'deferred-regl';
const dregl = defregl();

// Wrap the deferred-regl wrapper
// so that it returns a react element when called
// and also has prototype with extended regl resource generators
const reactRegl = function(definitionProps){
  return function ReactReglComponent(executionProps){
    const merged = {definitionProps, executionProps};
    merged.dregl = dregl;
    return React.createElement('ReglDraw', merged, executionProps.children);
  }
}
Object.setPrototypeOf(reactRegl, dregl);

export default reactRegl;
