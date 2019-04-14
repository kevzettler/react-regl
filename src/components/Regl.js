import React from 'react';
import PropTypes from 'prop-types';
import ReglRenderer from '../renderer.js';
import reglInit from 'regl';

import ReglRootNode from '../nodes/ReglRootNode';

export default class Regl extends React.Component {
  regl = null
  tick = null;
  canvasRef = null;
  rootNode = null;

  componentWillUnmount(){
    ReglRenderer.updateContainer(null, this.mountNode, this);
    this.regl.destroy();
  }

  constructor(props, context){
    super(props, context);
  }

  getChildContext(){
    if(this.context && this.context.store){
      return {store: this.context.store};
    }
    return this.context;
  }

  componentDidMount(){
    const canvasRef = this.props.canvas || this.canvasRef;
    const gl = canvasRef.getContext("webgl", {
      alpha: false,
      antialias: false,
      stencil: false,
      preserveDrawingBuffer: false
    });

    const regl = reglInit({ gl });
    regl.cache = {};
    this.regl = regl;

    if(this.props.onReglInit &&
       typeof this.props.onReglInit === 'function'){
      this.props.onReglInit(regl);
    }

    this.rootNode = ReglRenderer.createContainer(new ReglRootNode(regl, this.context));

    this.regl.clear({
      color: this.props.color || [0, 0, 0, 1],
      depth: this.props.depth || 1
    });

    ReglRenderer.updateContainer(this.props.children, this.rootNode, this);
    this.rootNode.containerInfo.render();

    if(this.props.forceRedrawOnTick === true){
      this.tick = regl.frame(() => {
        this.regl.clear({
          color: this.props.color || [0, 0, 0, 1],
          depth: this.props.depth || 1
        });
        this.rootNode.containerInfo.render();
      });
    }

    if(this.props.onFrame && typeof this.props.onFrame === 'function'){
      this.tick = regl.frame(this.props.onFrame);
    }
  }

  componentDidUpdate(prevProps, prevState){
    this.regl.clear({
      color: this.props.color || [0, 0, 0, 1],
      depth: this.props.depth || 1
    });

    if(prevProps.width !== this.props.width ||
       prevProps.height !== this.props.height){
      this.regl.poll();
    }

    ReglRenderer.updateContainer(this.props.children, this.rootNode, this);
    this.rootNode.containerInfo.render();
  }

  componentWillUnmount(){
    if(this.tick){
      this.tick.cancel();
    }

    if(this.regl){
      this.regl.destroy();
    }
  }

  render(){
    if(this.props.canvas){
      return null;
    }

    return (
      <canvas ref={inst => {this.canvasRef = inst}}
              width={this.props.width}
              height={this.props.height} />
    )
  }
}
// In order to support react-redux apps
// the store needs to be passed to the reconciler on context
Regl.contextTypes = { store: PropTypes.object };
Regl.childContextTypes = { store: PropTypes.object };
