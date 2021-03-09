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
  id?: string

  constructor(props: IDrawNodeProps){
    super(props);
    if(props.executionProps?.id) {
      this.id = props.executionProps.id;
    }
    this.dregl = props.dregl;
    this.drawCommand = props.dregl(props.definitionProps)
    this.executionProps = props.executionProps?.batch ? props.executionProps.batch : props.executionProps;
  }
  render(){
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
