import { DrawConfig, DrawCommand, Regl } from 'regl';
import Node, { IBaseNodeProps } from '../nodes/Node';

export interface IDrawNodeProps extends IBaseNodeProps {
  dregl: Regl;
  drawCommand: DrawCommand,
  definitionProps: DrawConfig & { id?: string }
  executionProps: any
};

function expandDeferredProps(deferredProps: any, regl: Regl) {
  return Object.entries(deferredProps).reduce((expanded: any, [key, val]: [string, any]) => {
    if (typeof val === 'function' && val.deferred_regl_resource) {
      //@ts-ignore regl not indexed but we need to dynamically access method
      expanded[key] = regl[val.key](val.opts)
    } else if (Object.prototype.toString.call(val) === '[object Object]' && key !== 'children') {
      expanded[key] = expandDeferredProps(val, regl)
    } else {
      expanded[key] = val
    }
    return expanded;
  }, {})
}

export default class DrawNode extends Node {
  drawCommand: DrawCommand
  executionProps: any
  definitionProps: any

  constructor(props: IDrawNodeProps, regl: Regl) {
    super(props, regl);
    if (props.definitionProps?.id) this.id = props.definitionProps.id; delete props.definitionProps.id;
    if (props.executionProps?.id) this.id = props.executionProps.id;

    this.definitionProps = {
      ...props.definitionProps,
    }

    // Expand any deferred regl functions
    if (props.definitionProps.attributes) this.definitionProps.attributes = expandDeferredProps(props.definitionProps.attributes, regl);
    if (props.definitionProps.uniforms) this.definitionProps.uniforms = expandDeferredProps(props.definitionProps.uniforms, regl);

    this.drawCommand = regl(this.definitionProps)

    if (props.executionProps) {
      this.executionProps = props.executionProps.batch ?
        props.executionProps.batch.map((batchProp: any) => expandDeferredProps(batchProp, regl)) :
        expandDeferredProps(props.executionProps, regl);
    }
  }

  render() {
    if (this.children.length) {
      this.drawCommand(this.executionProps, () => {
        this.children.forEach((child) => {
          child.render();
        })
      });
    } else {
      this.drawCommand(this.executionProps);
    }
  }
}
