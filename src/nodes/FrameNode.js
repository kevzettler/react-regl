import Node from '../nodes/Node'
import regl from '../'

export default class FrameNode extends Node{
  constructor(props){
    super(props);
    regl.frame((...args) => {
      if(props.onFrame){
        props.onFrame(...args);
        this.render();
      }
    })
  }
}
