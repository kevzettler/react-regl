import Node from '../nodes/Node.js';

const drawNode = (node) => {
  if(node.drawCommand && node.children.length){
    return node.drawCommand(node.packedProps, () => {
      return node.children.forEach(drawNode);
    })
  }

  if(node.drawCommand && !node.children.length){
    return node.drawCommand(node.packedProps);
  }

  if(!node.drawCommand && node.children.length){
    return node.children.forEach(drawNode);
  }

  return null;
};

export default class ReglRootNode extends Node {
  constructor(reglRef, store){
    super(reglRef);
    this.regl = reglRef
    if(store){
      this.store = store;
    }
  }

  render(){
    drawNode(this);
  }
}
