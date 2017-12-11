import Node from '../nodes/Node.js';

let x = 0;
let y = 0;

const drawNode = (node) => {
  if(node.drawCommand && node.children.length){
    return node.drawCommand(node.packedProps, function drawCommandContext() {
      x=node.children.length;
      while(x--){
        drawNode(node.children[x]);
      }
      return;
    })
  }

  if(node.drawCommand && !node.children.length){
    return node.drawCommand(node.packedProps);
  }

  if(!node.drawCommand && node.children.length){
    y=node.children.length;
    while(y--){
      drawNode(node.children[y]);
    }
  }

  return null;
};

export default class ReglRootNode extends Node {
  constructor(reglRef, context){
    super(reglRef);
    this.regl = reglRef
    if(context.store){
      this.store = store;
    }
  }

  render(){
    drawNode(this);
  }
}
