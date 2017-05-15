import batchChildren from "./batchChildren.js";

const topDownDrawScopes = (node) => {
  if(!node){ return () => { debugger; };}

  if(!node.children && node.data.drawCommand){
    return () => {
      node.data.drawCommand(node.data);
    }
  }

  if(node.children){
    const children = batchChildren(node.children);
    const childCommands = children.map(topDownDrawScopes);

    if(node.data.drawCommand){
      return () => {
        node.data.drawCommand(node.data, () => {
          childCommands.forEach((childCommand) => {
            childCommand()
          });
        });
      }
    }

    if(!node.data.drawCommand){
      return () => {
        childCommands.forEach((childCommand) => {
          childCommand()
        });
      }
    }
  }

  return () => { };
};

export default topDownDrawScopes;
