export default class Node {
  parent = null;
  children = [];
  constructor(id){
    this.id = id;
  }

  appendChild(child){
    child.parent = this;
    this.children.push(child);
  }

  removeChild(child){
    const index = this.children.indexOf(child);
    child.parent = null;
    this.children.splice(index, 1);
  }

  insertBefore(child, beforeChild){
    const index = this.children.indexOf(beforeChild);
    child.parent = this;
    this.children.splice(index, 0, child);
  }

  render(){
    this.children.forEach((child) => child.render());
  }

  destroy(){
    this.children.forEach((child) => {
      child.destroy();
    })

    this.parent = null;
  }
}
