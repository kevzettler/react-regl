import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import ReglInit from 'regl';

import ReactUpdates from 'react-dom/lib/ReactUpdates';
import ReactInstanceMap from 'react-dom/lib/ReactInstanceMap';

import ContainerMixin from './ContainerMixin';

import Node from 'display-tree';

import batchChildren from './util/batchChildren';
import topDownDrawScopes from './util/topDownDrawScopes';

import PropTypes from 'prop-types';

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

    this._hostContainerInfo = {
      _idCounter: 0
    };

    this.node = Node();
    this.node.type = "Regl";

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

Regl.childContextTypes = {
  regl: PropTypes.func
};

export default Regl;
