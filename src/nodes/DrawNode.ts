import { DrawConfig, DrawCommand, Regl } from 'regl';
import Node, {IBaseNodeProps} from '../nodes/Node';

export interface IDrawNodeProps extends IBaseNodeProps {
  dregl: Regl;
  drawCommand: DrawCommand,
  definitionProps: DrawConfig
  executionProps: any
};


export default class DrawNode extends Node {
  dregl: Regl
  drawCommand: DrawCommand
  executionProps: any

  constructor(props: IDrawNodeProps){
    super(props);
    this.dregl = props.dregl;
    this.drawCommand = props.dregl(props.definitionProps)
    this.executionProps = props.executionProps.batch ? props.executionProps.batch : props.executionProps;
  }
  render(){
    if(this.children.length){
      this.drawCommand(this.executionProps, () => {
        this.children.forEach((child) => {
          child.render();
        })
      });
    }else{
      this.drawCommand(this.executionProps);
    }
  }
}
