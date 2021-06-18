import { Regl } from 'regl';
export interface IBaseNodeProps{
  id?: string
  regl: Regl
}

export default class Node {
  id?: string | null = null;
  parent?: Node | null = null;
  children: Node[] = [];
  regl?: Regl
  constructor({ id, regl }: IBaseNodeProps){
    this.id = id;
    this.regl = regl;
  }

  appendChild(child: Node){
    child.parent = this;
    this.children.push(child);
  }

  removeChild(child: Node){
    const index = this.children.indexOf(child);
    child.parent = null;
    this.children.splice(index, 1);
  }

  insertBefore(child: Node, beforeChild: Node){
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

    if(this.parent){
      this.parent = null;
    }
  }
}
