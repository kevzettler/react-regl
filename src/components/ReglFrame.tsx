import React from 'react';
import PropTypes from 'prop-types'
import { FiberRoot } from 'react-reconciler'
import reglInit, { FrameCallback, Cancellable, Vec4 } from 'regl';
import {vec4} from 'gl-matrix'
import { IDregl } from 'deferred-regl';
import ReglRenderer from '../renderer';

import reglDefer from '../reglDefer';


import Node from '../nodes/Node';

interface ReglFrameProps{
  canvasRef?: HTMLCanvasElement
  color?: vec4,
  width?: number
  height?: number
  onLost?: () => void
  onRestore?: () => void
  depth?: 1 | 0
  onFrame?: FrameCallback
}

export class ReglFrame extends React.Component<ReglFrameProps, {}> {
  regl?: IDregl
  tick?: Cancellable
  canvasRef: HTMLCanvasElement | null = null
  rootNode?: FiberRoot
  initQueue: any[] = []

  static childContextTypes = {
    reactify: PropTypes.bool
  }

  getChildContext(){
    return {
      reactify: true
    }
  }

  componentWillUnmount(){
    if(!this.rootNode) throw new Error('regl root node missing on component unmount');
    ReglRenderer.updateContainer(null, this.rootNode, this, () => {
      reglDefer.setQueue(this.initQueue.slice(0));
      if(this.tick) this.tick.cancel();
      if(this.regl){
        this.regl.destroy();
      }
      reglDefer.setRegl();
    });
  }

  componentDidMount(){
    const canvasRef = this.props.canvasRef || this.canvasRef;
    let reglHandle = null
    if(canvasRef){
      const gl = canvasRef.getContext("webgl", {
        alpha: false,
        antialias: false,
        stencil: false,
        preserveDrawingBuffer: false
      });
      if(!gl) throw new Error('failed to aquire a gl context for regl');
      reglHandle = reglInit({ gl });
    }else{
      reglHandle = reglInit();
    }

    this.initQueue = reglDefer.queue.slice(0);
    reglDefer.setRegl(reglHandle);
    this.regl = reglDefer;

    const rootNode = ReglRenderer.createContainer(new Node({id: 'react-regl-root'}), false, false);
    this.rootNode = rootNode

    this.regl.on('lost', () => {
      console.error('Regl WebGL context lost');
      if(this.props.onLost) this.props.onLost();
    })

    this.regl.on('restore', () => {
      console.log('Regl WebGL context restored');
      if(this.props.onRestore) this.props.onRestore();
    })

    const color: vec4 = this.props.color ? this.props.color as Vec4 : [0,0,0,1]
    this.regl.clear({
      color,
      depth: this.props.depth || 1
    });

    ReglRenderer.updateContainer(this.props.children, this.rootNode, this, () => {
      rootNode.containerInfo.render();
    });

    if(this.props.onFrame && typeof this.props.onFrame === 'function'){
      this.tick = this.regl.frame((...args) => {
        if(this.props.onFrame) this.props.onFrame(...args);
        if(this.rootNode) this.rootNode.containerInfo.render();
      });
    }
  }

  componentDidUpdate(
    prevProps: ReglFrameProps,
    prevState: ReglFrameProps
  ){
    if(
      prevProps.width !== this.props.width ||
      prevProps.height !== this.props.height
    ){
      if(this.regl) {
        this.regl.poll();
      }
    }

    if(!this.rootNode) throw new Error("regl rootNode was undefined...");
    ReglRenderer.updateContainer(this.props.children, this.rootNode, this, () => {
      if(!this.rootNode) throw new Error("regl rootNode was undefined on update...");
      this.rootNode.containerInfo.render();
    });
  }

  render(){
    return (
        (this.props.canvasRef || (!this.props.width && !this.props.height)) ?
         null
        :
         <canvas
           ref={(canvasRef) => { if(canvasRef) this.canvasRef = canvasRef}}
           width={this.props.width}
           height={this.props.height}
         />
    )
  }
}
