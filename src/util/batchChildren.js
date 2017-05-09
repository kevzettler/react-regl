const batchChildren = (children) => {
  if(!children){
    return [];
  }

  if(children.length === 1){
    return children;
  }

  return children.reduce((accum, child, idx, orgArray) => {
    if(child.children){
      accum[`scope-${idx}`] = child;
    }

    if(!child.data.drawCommand){
      accum[`scope-nodraw-${idx}`] = child;
    }

    if(!child.children && child.data.drawCommand){
      const key = `${child.data.drawCommand && child.data.drawCommand.toString()}`;
      if(!accum[key]){
        const data = new Array();
        data.drawCommand = child.data.drawCommand;
        accum[key] = {
          data: data,
        }
      }
      
      delete child.data.drawCommand;
      accum[key].data.push(child.data);
    }
    
    return (idx === orgArray.length - 1) && Object.values(accum) || accum;
  }, {});
}

export default batchChildren;
