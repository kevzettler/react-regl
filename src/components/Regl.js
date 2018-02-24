import React from 'react';
import PropTypes from 'prop-types';
import ReglRenderer from '../renderer.js';
import reglInit from 'regl';

import ReglRootNode from '../nodes/ReglRootNode';

export default class Regl extends React.Component {
  regl = null
  tick = null;

  componentWillUnmount(){
    this.regl.destroy();
  }

  constructor(props, context){
    super(props, context);
    this.rootNode = null;
  }

  getChildContext(){
    if(this.context.store){
      return {store: this.context.store};
    }
  }

  componentDidMount(){
    const canvasRef = this.props.canvas || this.refs.canvas;
    const gl = canvasRef.getContext("webgl", {
      alpha: false,
      antialias: false,
      stencil: false,
      preserveDrawingBuffer: false
    });

    const regl = reglInit({ gl });
    regl.cache = {};
    this.regl = regl;


    if(this.props.onFrame){
      this.tick = regl.frame(this.props.onFrame);
    }

    if(this.props.onReglInit &&
       typeof this.props.onReglInit === 'function'){
      this.props.onReglInit(regl);
    }

    this.rootNode = ReglRenderer.createContainer(new ReglRootNode(regl, this.context));

    this.regl.clear({
      color: this.props.color || [0, 0, 0, 1],
      depth: this.props.depth || 1
    });

    ReglRenderer.unbatchedUpdates(() => {
      ReglRenderer.updateContainer(this.props.children, this.rootNode, this);
    });

    this.rootNode.containerInfo.render()
  }

  componentDidUpdate(prevProps, prevState){
    this.regl.clear({
      color: this.props.color || [0, 0, 0, 1],
      depth: this.props.depth || 1
    });
    ReglRenderer.updateContainer(this.props.children, this.rootNode, this);
    this.rootNode.containerInfo.render();
  }

  componentWillUnmount(){
    if(this.tick){
      this.tick.cancel();
    }
  }

  render(){
    if(this.props.canvas){
      return null;
    }

    return (
      <canvas ref="canvas"
              width={this.props.width}
              height={this.props.height} />
    )
  }
}
// In order to support react-redux apps
// the store needs to be passed to the reconciler on context
Regl.contextTypes = { store: PropTypes.object };
Regl.childContextTypes = { store: PropTypes.object };
