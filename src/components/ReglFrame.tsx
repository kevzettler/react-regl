import React from 'react';
import PropTypes from 'prop-types'
import { FiberRoot } from 'react-reconciler'
import reglInit, { Cancellable, Vec4, Regl, DefaultContext } from 'regl';
import {vec4} from 'gl-matrix'
import ReglRenderer from '../renderer';
import defregl, { DeferredRegl } from 'deferred-regl';

import globalDeferredRegl from '../reactRegl';
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
  onFrame?: (context: DefaultContext, regl: Regl) => void;
  webGLContext: WebGLContextAttributes
}

export class ReglFrame extends React.Component<ReglFrameProps, {}> {
  reglHandle?: any
  tick?: Cancellable
  canvasRef: HTMLCanvasElement | null = null
  fiberRoot?: FiberRoot
  initQueue: any[] = []
  legitRegl?: Regl
  deferredRegl?: DeferredRegl

  static childContextTypes = {
    reactify: PropTypes.bool,
  }

  getChildContext(){
    return {
      reactify: true
    }
  }

  componentWillUnmount(){
    if(!this.fiberRoot) throw Error('failed to unmount missing fiberRoot')
    ReglRenderer.updateContainer(null, this.fiberRoot, this, () => {
      globalDeferredRegl.setQueue(this.initQueue.slice(0));
      if(this.tick) this.tick.cancel();
      if(this.legitRegl) this.legitRegl.destroy();
      globalDeferredRegl.setRegl();
    });
  }

  componentDidMount(){
    const canvasRef = this.props.canvasRef || this.canvasRef;
    const webGLContextProps = this.props.webGLContext || {};
    let initProps: reglInit.InitializationOptions = {}
    if(canvasRef){
      const gl = canvasRef.getContext("webgl", {
        alpha: false,
        antialias: false,
        stencil: false,
        preserveDrawingBuffer: false,
        ...webGLContextProps,
      });
      if(!gl) throw new Error('failed to aquire a gl context for regl');
      initProps.gl = gl;
    }

    if(this.props.extensions) initProps.extensions = this.props.extensions
    if(this.props.optionalExtensions) initProps.optionalExtensions = this.props.optionalExtensions

    this.deferredRegl = defregl();
    this.legitRegl = reglInit(initProps);

    if(this.props.forwardedRef) {
      //@ts-ignore
      this.props.forwardedRef.current = this.legitRegl._gl.canvas
    }

    const node0 = new Node({id: 'react-regl-root', regl: this.legitRegl});
    const fiberRoot = ReglRenderer.createContainer(node0, false, false);
    this.fiberRoot = fiberRoot

    this.legitRegl.on('lost', () => {
      console.error('Regl WebGL context lost');
      if(this.props.onLost) this.props.onLost();
    })

    this.legitRegl.on('restore', () => {
      console.log('Regl WebGL context restored');
      if(this.props.onRestore) this.props.onRestore();
    })

    const color: vec4 = this.props.color ? this.props.color as Vec4 : [0,0,0,1]
    this.legitRegl.clear({
      color,
      depth: this.props.depth || 1
    });

    //
    // copy all loose global resources to this deferred state
    //
    // This replicate method is used so that
    // one deferred regl can point all its methods
    // to another deferred instance
    // This is used in react-regl so that the global instance
    // can be pointed to componets as they are rendering
    // This is hack so users can define regl resources regl.texture regl.buffer etc
    // in the global space and have them magically work in the react chain
    // this is super brittle and needs a better solution.
    globalDeferredRegl.replicateTo(this.deferredRegl);
    this.deferredRegl.setRegl(this.legitRegl);

    // This is where children get mounted to root node
    // and DrawNode constructors called
    // Update all global deferred functions to
    ReglRenderer.updateContainer(this.props.children, this.fiberRoot, this, () => {
      fiberRoot.containerInfo.render();
    });

    if(this.props.onFrame && typeof this.props.onFrame === 'function'){
      this.tick = this.legitRegl.frame((context: DefaultContext) => {
        if(this.props.onFrame && this.legitRegl) this.props.onFrame(context, this.legitRegl);
        if(this.fiberRoot) this.fiberRoot.containerInfo.render();
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
      if(this.legitRegl) {
        this.legitRegl.poll();
      }
    }

    if(!this.fiberRoot) throw new Error("regl fiberRoot was undefined...");
    ReglRenderer.updateContainer(this.props.children, this.fiberRoot, this, () => {
      if(!this.fiberRoot) throw new Error("regl fiberRoot was undefined on update...");
      this.fiberRoot.containerInfo.render();
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
