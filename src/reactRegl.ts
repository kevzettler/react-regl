import React, { useContext } from 'react';
import { DrawCommand, DrawConfig, DynamicVariable, DefaultContext } from 'regl'
import defregl, { DeferredRegl } from './deferred-regl';

// Helper types for merging deferredRegl and ReactRegl
type MergeLeft<T1, T2 extends Record<any, any>> = {
  [Prop in keyof T1 as Exclude<Prop, keyof T2>]: T1[Prop]
}
type Merge<T1, T2 extends Record<any, any>> = MergeLeft<T1, T2> & T2;

const globalDeferredRegl = defregl();

export const ReglFrameContext = React.createContext<boolean>(false);

export interface ReactReglComponent<DefinitionProps> extends DrawCommand {
  <
    ExecutionProps extends {} = {}
  >(
    executionProps: ExecutionProps,
    scopeFn: (context: DefaultContext) => void
  ): React.ReactElement<DefinitionProps & ExecutionProps & DeferredRegl, 'ReglDraw'> | null
}

type ReactRegl<
  Props extends {} = {},
> = Merge<DeferredRegl, {
  (drawConfig?: DrawConfig): ReactReglComponent<Props>
  //FIXME
  // this is an override for the regl.prop method
  // theres some magic with the base regl.prop declaration that is failing
  // https://github.com/regl-project/regl/issues/602
  prop<Key>(name: Key): DynamicVariable<Key>
}>



// This is the main libray interface function
// it mimics the regl interface of: command = regl({definitionProps});
// where reactRegl = regl
// The returned command then
// Detects wether its been invoked in a React tree or as a regular regl function
const reactRegl = function (definitionProps: DrawConfig) {
  let drawCommand: DeferredRegl | null = null;

  // This the returned 'command' that mimics a returned regl command
  // command = regl({definitionProps})
  // command({executionProps}, scopeFn(context){})
  const ReactReglComponent = (
    // TODO execution props should enforce type safety of DynamicVariables for user defined `regl.prop`
    executionProps?: Partial<typeof definitionProps & { children?: React.ReactNode }>,
    scopeFn?: (context: DefaultContext) => void
  ) => {
    // check react context to see if this function is being invoked in a reglFrame tree
    const reactContextValue = useContext(ReglFrameContext);

    // This is the react tree usage.
    // return a react element that the reconciler will use to build a regl tree
    if (executionProps && reactContextValue === true) {
      const mergedProps = { definitionProps, executionProps };
      const children = executionProps.children ? executionProps.children : null
      // this creates a react element of type 'ReglDraw'
      // the reconcilder method `createInstance` looks for this type of element
      // createInstance then makes a DrawNode instance
      // DrawNode abstracts regls rendering calls
      return React.createElement('ReglDraw', mergedProps, children);
    }

    // This is the regular regl call usage
    if (drawCommand === null) {
      drawCommand = globalDeferredRegl(definitionProps);
    }
    if (drawCommand === null) {
      throw new Error('failed to initalize regl drawCommand')
    }

    let drawCommandProps = executionProps ? executionProps : {}
    return drawCommand(drawCommandProps, scopeFn);
  }

  return ReactReglComponent
}
Object.setPrototypeOf(reactRegl, globalDeferredRegl)

export default reactRegl as ReactRegl;
