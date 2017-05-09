import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import ReglInit from 'regl';

import ReactUpdates from 'react-dom/lib/ReactUpdates';
import ReactInstanceMap from 'react-dom/lib/ReactInstanceMap';

import ContainerMixin from './ContainerMixin';

import Node from 'display-tree';


const batchChildren = (children) => {
  if(!children){
    return []
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


class Regl extends Component {
  constructor(props, context){
    super(props, context);
    
    this.state = {
      width: props.width || window.innerWidth,
      height: props.height || window.innerHeight
    };
  }
  
  componentDidMount() {
    this._debugID = this._reactInternalInstance._debugID;

    this.node = Node();
    this.node.type = "Regl";

    debugger;
    const canvasRef = this.props.canvas || this.refs.canvas;

    const regl = ReglInit(canvasRef);
    regl.renderers = {};
    this.regl = regl;

    if(this.props.onFrame){
      regl.frame(this.props.onFrame);
    }

    const transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
    transaction.perform(
      this.mountAndInjectChildren,
      this,
      this.props.children,
      transaction,
      Object.assign({}, ReactInstanceMap.get(this)._context, { regl })
    );
    
    ReactUpdates.ReactReconcileTransaction.release(transaction);

    this.drawScope = topDownDrawScopes(this.node);
    this.drawScope();
  }
  
  componentDidUpdate(oldProps) {
    const transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
    transaction.perform(
      this.updateChildren,
      this,
      this.props.children,
      transaction,
      Object.assign({}, ReactInstanceMap.get(this)._context, { regl: this.regl })
    );
    ReactUpdates.ReactReconcileTransaction.release(transaction);


    if(this.props.clear){
      this.regl.clear(this.props.clear);
    }

    this.drawScope();
  }
  
  render() {
    if(this.props.canvas){
      return null;
    }
    
    const { width, height } = this.state;
    return (
      <canvas ref="canvas" width={width} height={height} />
    )
  }
}

Object.assign(Regl.prototype, ContainerMixin);
export default Regl;
