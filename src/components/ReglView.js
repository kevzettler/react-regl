import React from 'react';
import ReglRenderer from '../renderer.js';
import reglInit from 'regl';
import reglDefer from '../reglDefer';

import Node from '../nodes/Node';

export default class ReglView extends React.Component {
  regl = null
  tick = null;
  canvasRef = null;
  rootNode = null;
  initQueue = [];

  componentWillUnmount(){
    ReglRenderer.updateContainer(null, this.rootNode, this, () => {
      reglDefer.setRegl();
      reglDefer.setQueue(this.initQueue.slice(0));
      this.regl.destroy();
    });
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
    this.regl = regl;
    this.initQueue = reglDefer.queue.slice(0);
    reglDefer.setRegl(regl);

    this.rootNode = ReglRenderer.createContainer(new Node('root'));

    this.regl.on('lost', () => {
      console.error('Regl context lost');
      if(this.props.onLost) this.props.onLost();
    })

    this.regl.on('restore', () => {
      console.log('Regl context restore');
      if(this.props.onRestore) this.props.onRestore();
    })

    this.regl.clear({
      color: this.props.color || [0, 0, 0, 1],
      depth: this.props.depth || 1
    });

    ReglRenderer.updateContainer(this.props.children, this.rootNode, this);
    this.rootNode.containerInfo.render();

    if(typeof this.props.onFrame === 'function'){
      this.tick = regl.frame((...args) => {
        this.props.onFrame(...args);
        this.rootNode.containerInfo.render();
      });
    }
  }

  componentDidUpdate(prevProps, prevState){
    if(prevProps.width !== this.props.width ||
       prevProps.height !== this.props.height){
      this.regl.poll();
    }

    ReglRenderer.updateContainer(this.props.children, this.rootNode, this);
    this.rootNode.containerInfo.render();
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
