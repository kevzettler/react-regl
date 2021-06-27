/// <reference path="./types/deferred-regl.d.ts" />
/// <reference types="./types/deferred-regl" />
import React, { ReactChildren } from 'react';
import PropTypes from 'prop-types'
import { DrawCommand, DrawConfig, DefaultContext, DynamicVariable} from 'regl'
import defregl, { DeferredRegl } from 'deferred-regl';


const globalDeferredRegl = defregl();

export interface ReactReglComponent<DefinitionProps> extends DrawCommand {
  <
   ExecutionProps extends {} = {}
  >(
    executionProps: ExecutionProps, contextOrRef: {reactify?: boolean}
  ): React.ReactElement<DefinitionProps & ExecutionProps & DeferredRegl, 'ReglDraw'> | null
}


type ReactRegl<
Uniforms extends {} = {},
Attributes extends {} = {},
Props extends {} = {},
OwnContext extends {} = {},
ParentContext extends DefaultContext = DefaultContext
> = DeferredRegl & {
  (drawConfig: DrawConfig<Uniforms, Attributes, Props, OwnContext, ParentContext>): ReactReglComponent<Props>
  //FIXME
  // this is an override for the regl.prop method
  // theres some magic with the base regl.prop declaration that is failing
  // https://github.com/regl-project/regl/issues/602
  prop<Key>(name: Key): DynamicVariable<Key>
}

// Wrap the deferred-regl wrapper
// so that it returns a react element when called
// within a react context
const reactRegl: unknown = function(definitionProps: DrawConfig){
  let drawCommand: DrawCommand | DeferredRegl | null = null;
  // TODO execution props should enforce type safety of DynamicVariables for user defined `regl.prop`
  const ReactReglComponent = (
    executionProps?: Partial<typeof definitionProps & {children?: ReactChildren}>,
    contextOrRef?: any
  ) => {
    // intalized as a react context return react element
    if(executionProps && contextOrRef?.reactify === true){
      const merged = {definitionProps, executionProps};
      const children = executionProps.children ? executionProps.children : null
      return React.createElement('ReglDraw', merged, children);
    }

    // intalized as regular regl command
    if(drawCommand === null){
      drawCommand = globalDeferredRegl(definitionProps);
    }
    if(drawCommand === null){
      throw new Error('failed to initalize regl drawCommand')
    }

    let drawCommandProps = executionProps ? executionProps : {}
    return drawCommand(drawCommandProps, contextOrRef)
  }

  ReactReglComponent.contextTypes = {
    reactify: PropTypes.bool
  }

  return ReactReglComponent
}
Object.setPrototypeOf(reactRegl, globalDeferredRegl)


export default reactRegl as ReactRegl;
