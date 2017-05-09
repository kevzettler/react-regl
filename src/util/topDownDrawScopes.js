const topDownDrawScopes = (node) => {
  if(!node){ return () => {};}

  if(!node.children && node.data.drawCommand){
    return () => {
      node.data.drawCommand(node.data);
    }
  }

  if(node.children){
    const children = batchChildren(node.children);

    if(node.data.drawCommand){
      return () => {
        node.data.drawCommand(node.data, () => {
          children.forEach((child) => {
            topDownDrawScopes(child)();
          })
        });
      }
    }

    if(!node.data.drawCommand){
      return () => {
        children.forEach((child) => {
          topDownDrawScopes(child)();
        });      
      }
    }
  }

  return () => {};
};

export default topDownDrawScopes;
