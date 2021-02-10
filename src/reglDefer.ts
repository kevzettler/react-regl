/// <reference path="./types/deferred-regl.d.ts" />
import React from 'react';
import PropTypes from 'prop-types'
import defregl, { IDregl } from 'deferred-regl';
import { DrawConfig, DrawCommand, DefaultContext, DynamicVariable } from 'regl'

const dregl: IDregl = defregl();

export interface ReactReglComponent<DefinitionProps> extends DrawCommand {
  <
   ExecutionProps extends {} = {}
  >(
    executionProps: ExecutionProps, contextOrRef: {reactify?: boolean}
  ): React.ReactElement<DefinitionProps & ExecutionProps & IDregl, 'ReglDraw'>,
}

interface ReactRegl extends IDregl{
  <
  Uniforms extends {} = {},
  Attributes extends {} = {},
  Props extends {} = {},
  OwnContext extends {} = {},
  ParentContext extends DefaultContext = DefaultContext
  >(
    drawConfig: DrawConfig<Uniforms, Attributes, Props, OwnContext, ParentContext>,
  ): ReactReglComponent<Props>

  //FIXME
  // this is an override for the regl.prop method
  // theres some magic with the base regl.prop declaration that is failing
  // https://github.com/regl-project/regl/issues/602
  prop<Key>(name: Key): DynamicVariable<Key>;
}

// Wrap the deferred-regl wrapper
// so that it returns a react element when called
// within a react context
const reactRegl: unknown = function(definitionProps: DrawConfig){
  let drawCommand: DrawCommand | null = null;
  const ReactReglComponent = (executionProps: any, contextOrRef: any) => {
    if(contextOrRef?.reactify === true){
      const merged = {definitionProps, executionProps, dregl};
      return React.createElement('ReglDraw', merged, executionProps.children);
    }

    if(drawCommand === null){
      drawCommand = dregl(definitionProps);
    }

    if(drawCommand === null){
      throw new Error('failed to initalize regl drawCommand')
    }
    return drawCommand(executionProps, contextOrRef)
  }

  ReactReglComponent.contextTypes = {
    reactify: PropTypes.bool
  }
  return ReactReglComponent
}
// set prototype with extended regl resource generators
Object.setPrototypeOf(reactRegl, dregl);

export default reactRegl as ReactRegl
