import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import ReglInit from 'regl';

import ReactUpdates from 'react-dom/lib/ReactUpdates';
import ReactInstanceMap from 'react-dom/lib/ReactInstanceMap';

import ContainerMixin from './ContainerMixin';

import Node from 'scene-tree';

import batchChildren from './util/batchChildren';
import topDownDrawScopes from './util/topDownDrawScopes';

import PropTypes from 'prop-types';

// Mutates the node!!!
const getReglDefintionForNode = (node, regl) =>{

  const reglDefinition = {}
  const reglKeys = [
    'vert', 'frag', 'attributes', 'uniforms', 'count', 'primitive',
    'count', 'offset', 'instances', 'elements', 'profile', 'depth',
    'blend', 'stencil', 'cull', 'polygonOffset', 'cull', 'scissor'
  ];

  const sceneNodeKeys = ['position', 'rotation', 'scale'];

  Object.keys(node.data).forEach((definitionKey) => {
    if(['vert', 'frag'].indexOf(definitionKey) !== -1){
      reglDefinition[definitionKey] = node.data[definitionKey];
      delete node.data[definitionKey];
      return;
    }

    if(sceneNodeKeys.indexOf(definitionKey) !== -1){
      return;
    }

    if(['attributes', 'uniforms'].indexOf(definitionKey) !== -1){
      reglDefinition[definitionKey] = {};
      Object.keys(node.data[definitionKey]).forEach((reglProp) => {
        node.data[reglProp] = node.data[definitionKey][reglProp];
        reglDefinition[definitionKey][reglProp] = regl.prop(`${definitionKey}.${reglProp}`);
      });
      return;
    }
    
    if(['string', 'number', 'boolean'].indexOf(typeof definitionKey) !== -1){
      reglDefinition[definitionKey] = regl.prop(definitionKey);
      return;
    }

    reglDefinition[definitionKey] = (context, props, batchId) => {
      return props[definitionKey];
    };
  });

  return reglDefinition;
}

const bucketDrawCalls = (tree, regl) => {
  const buckets = tree.flat().reduce((accum, node, index, orgArray) => {
    if(!node.data.vert && !node.data.frag){
      if(index === orgArray.length - 1){
        return Object.values(accum);
      }
      return accum;
    }
    
    const shaderKey = `${node.data.vert && node.data.frag && node.data.vert + node.data.frag}`;

    //Mutates the node 1!!
    const drawDef = getReglDefintionForNode(node, regl);

    //modelMatrix is automattically calculated by scene-tree behind the scenes
    drawDef.uniforms.modelMatrix = regl.prop('modelMatrix');
    drawDef.uniforms.normalMatrix = regl.prop('normalMatrix');    

    if(!regl.cache[shaderKey]){
      regl.cache[shaderKey] = node.data.drawCommand = regl(drawDef);
    }
    
    node.data.drawCommand = regl.cache[shaderKey];

    if(!accum[shaderKey]){
      accum[shaderKey] = [];
    }

    node.data.positions = node.data.attributes.positions;
    
    accum[shaderKey].push(Object.assign(node.data, {
      modelMatrix: node.modelMatrix,
      normalMatirx: node.normalMatrix,
    }));


    if(index === orgArray.length - 1){
      return Object.values(accum);
    }

    return accum;
  }, {});

  return () => {
    if(!buckets || !buckets.length){ console.log('no drag calls'); return null; }
    //console.log(tree.flat()[2].data.positions[2], buckets[0][0].attributes.positions[2], buckets[0][0].positions[2], buckets[0][0].superpos[2]);
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
    regl.cache = {};
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

    this.node.tick();
    this.drawScope = bucketDrawCalls(this.node, this.regl);

    if(this.props.clear){
      this.regl.clear(this.props.clear);
    }
    
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

    this.node.tick();
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
