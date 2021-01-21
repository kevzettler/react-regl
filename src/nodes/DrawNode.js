import Node from '../nodes/Node';

export default class DrawNode extends Node {
  constructor(props){
    super(props);
    this.dregl = props.dregl;
    this.drawCommand = props.dregl(props.definitionProps)
    this.executionProps = props.executionProps;
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
