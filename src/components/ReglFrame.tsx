import React from 'react';
import PropTypes from 'prop-types'
import { FiberRoot } from 'react-reconciler'
import reglInit, { FrameCallback, Cancellable, Vec4 } from 'regl';
import {vec4} from 'gl-matrix'
import { IDregl } from 'deferred-regl';
import ReglRenderer from '../renderer';

import reactRegl from '../reactRegl';


import Node from '../nodes/Node';

interface ReglFrameProps{
  canvasRef?: HTMLCanvasElement
  forwardedRef?: (ref:HTMLCanvasElement) => void
  extensions?: string[]
  optionalExtensions?: string[]
  color?: vec4,
  width?: number
  height?: number
  onLost?: () => void
  onRestore?: () => void
  depth?: 1 | 0
  onFrame?: FrameCallback

}

export class ReglFrame extends React.Component<ReglFrameProps, {}> {
  reglHandle?: any
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
    if(!this.rootNode) {
      console.error('regl root node missing on component unmount?')
      reactRegl.setQueue(this.initQueue.slice(0));
      if(this.tick) this.tick.cancel();
      if(this.regl){
        this.regl.destroy();
      }
      reactRegl.setRegl();
    }else{
      ReglRenderer.updateContainer(null, this.rootNode, this, () => {
        reactRegl.setQueue(this.initQueue.slice(0));
        if(this.tick) this.tick.cancel();
        if(this.regl){
          this.regl.destroy();
        }
        reactRegl.setRegl();
      });
    }
  }

  componentDidMount(){
    const canvasRef = this.props.canvasRef || this.canvasRef;
    let initProps: reglInit.InitializationOptions = {}
    if(canvasRef){
      const gl = canvasRef.getContext("webgl", {
        alpha: false,
        antialias: false,
        stencil: false,
        preserveDrawingBuffer: false
      });
      if(!gl) throw new Error('failed to aquire a gl context for regl');
      initProps.gl = gl;
    }

    if(this.props.extensions) initProps.extensions = this.props.extensions
    if(this.props.optionalExtensions) initProps.optionalExtensions = this.props.optionalExtensions

    let reglHandle = reglInit(initProps)

    if(this.props.forwardedRef) {
      //@ts-ignore
      this.props.forwardedRef.current = reglHandle._gl.canvas
    }
    this.initQueue = reactRegl.queue.slice(0);

    reactRegl.setRegl(reglHandle);
    this.regl = reactRegl;

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
      console.log('Reglframe update!!!!!');
      this.rootNode.containerInfo.render();
    });
  }


  render(){
    // if user has passed an explicit canvas ref
    // or width && height have been omitted
    // return null and let regls default full canvas handle it.
    if(
      this.props.canvasRef ||
      (!this.props.width && !this.props.height)
    ){
      return null
    }

    // otherwise render a canvas node
    return (
      <canvas
        ref={(canvasRef) => {
          if(canvasRef){
            this.canvasRef = canvasRef;
            if(this.props.forwardedRef){
              this.props.forwardedRef(canvasRef);
            }
          }
        }}
        width={this.props.width}
        height={this.props.height}
      />
    )
  }
}
