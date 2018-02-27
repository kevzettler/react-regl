export default class Node {
  parent = null;
  children = [];

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
}
