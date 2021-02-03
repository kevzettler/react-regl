import React from 'react';
import PropTypes from 'prop-types'
import defregl, { IDregl } from 'deferred-regl';
import { DrawConfig, DrawCommand, DefaultContext } from 'regl'

const dregl = defregl();


interface ReactReglComponent<DefinitionProps> {
  <
   ExecutionProps extends {} = {}
  >(
    executionProps: ExecutionProps, contextOrRef?: {reactify?: boolean}
  ): React.ReactElement<DefinitionProps & ExecutionProps, 'ReglDraw'>,
}

interface IReactRegl extends IDregl{
  <
  Uniforms extends {} = {},
  Attributes extends {} = {},
  Props extends {} = {},
  OwnContext extends {} = {},
  ParentContext extends DefaultContext = DefaultContext
  >(
    drawConfig: DrawConfig<Uniforms, Attributes, Props, OwnContext, ParentContext>,
  ): ReactReglComponent<Props>
  contextTypes: {
    reactify?: boolean
  }
}

// Wrap the deferred-regl wrapper
// so that it returns a react element when called
// within a react context
const reactRegl = function(definitionProps: DrawConfig){
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
    return drawCommand(executionProps)
  }

  ReactReglComponent.contextTypes = {
    reactify: PropTypes.bool
  }
  return ReactReglComponent
}
// and also has prototype with extended regl resource generators
Object.setPrototypeOf(reactRegl, dregl);

// TSC is not picking up the prototype properties
// TODO  need to do a declaration merged
// https://stackoverflow.com/questions/12766528/build-a-function-object-with-properties-in-typescript
//@ts-ignore
export default reactRegl as IReactRegl;
