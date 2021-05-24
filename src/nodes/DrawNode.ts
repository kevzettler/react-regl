import { DrawConfig, DrawCommand, Regl } from 'regl';
import Node, {IBaseNodeProps} from '../nodes/Node';

export interface IDrawNodeProps extends IBaseNodeProps {
  dregl: Regl;
  drawCommand: DrawCommand,
  definitionProps: DrawConfig
  executionProps: any
};

function expandDeferredProps(executionProps: any){
  return Object.entries(executionProps).reduce((expanded: any, [key, val]: [string, any]) => {
    if(typeof val === 'function' && val.deferred_regl_resource){
      expanded[key] = val()
    }else{
      expanded[key] = val
    }
    return expanded;
  }, {})
}

export default class DrawNode extends Node {
  dregl: Regl
  drawCommand: DrawCommand
  executionProps: any
  id?: string

  constructor(props: IDrawNodeProps){
    super(props);
    if(props.executionProps?.id) {
      this.id = props.executionProps.id;
    }
    this.dregl = props.dregl;
    this.drawCommand = props.dregl(props.definitionProps)
    this.executionProps = props.executionProps?.batch ?
                          props.executionProps.batch.map(expandDeferredProps) :
                          expandDeferredProps(props.executionProps);
  }
  render(){
    // Expand any deferred regal functions
    if(this.children.length){
      this.drawCommand(this.executionProps, () => {
        this.children.forEach((child) => {
          child.render();
        })
      });
    }else{
      if(this.id === 'Bunnies') console.log(this.executionProps.view);
      this.drawCommand(this.executionProps);
    }
  }
}
