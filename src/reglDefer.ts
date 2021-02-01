import React from 'react';
import defregl, { IDregl } from 'deferred-regl';
import { DrawConfig, DefaultContext } from 'regl'

const dregl = defregl();

interface IReactRegl extends IDregl{
  <
  Uniforms extends {} = {},
  Attributes extends {} = {},
  Props extends {} = {},
  OwnContext extends {} = {},
  ParentContext extends DefaultContext = DefaultContext
  >(
    drawConfig: DrawConfig<Uniforms, Attributes, Props, OwnContext, ParentContext>,
  ): (executionProps: Props) => React.ReactElement
}

// Wrap the deferred-regl wrapper
// so that it returns a react element when called
// and also has prototype with extended regl resource generators
const reactRegl = function(definitionProps: DrawConfig){
  return function ReactReglComponent(executionProps: any){
    const merged = {definitionProps, executionProps, dregl};
    return React.createElement('ReglDraw', merged, executionProps.children);
  }
}
Object.setPrototypeOf(reactRegl, dregl);

export default reactRegl as IReactRegl;
