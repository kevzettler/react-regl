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


const bucketDrawCalls = (tree, regl) => {
  const buckets = tree.flat().reduce((accum, node, index, orgArray) => {
    if(!node.data.drawDefinition){
      if(index === orgArray.length - 1){
        return Object.values(accum);
      }
      return accum;
    }
    
    key = `${node.data.drawDefinition && node.data.drawDefinition.toString()}`;

    if(!regl.cache[key]){
      regl.cache[key] = node.data.drawDefinition(regl);
    }
    
    node.data.drawCommand = regl.cache[key];

    if(!accum[key]){
      accum[key] = [];
    }

    accum[key].push(Object.assign({},
                                  {
                                    modelMatrix: node.modelMatrix,
                                    normalMatirx: node.normalMatrix
                                  },
                                  node.data));

    if(index === orgArray.length - 1){
      return Object.values(accum);
    }

    return accum;
  }, {});

  return () => {
    buckets.forEach((bucket) => {
      bucket[0].drawCommand(bucket);
    });
  };
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

    this._hostContainerInfo = {
      _idCounter: 0
    };

    this.node = Node();
    this.node.type = "Regl";

    const canvasRef = this.props.canvas || this.refs.canvas;

    const regl = ReglInit(canvasRef);
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

    this.drawScope = bucketDrawCalls(this.node);
    this.drawScope();
//    this.drawScope = topDownDrawScopes(this.node);
//    this.drawScope();
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
