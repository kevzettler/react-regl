import React from 'react';
import PropTypes from 'prop-types'
import { FiberRoot } from 'react-reconciler'
import reglInit, { FrameCallback, Cancellable, Vec4, Regl } from 'regl';
import {vec4} from 'gl-matrix'
import ReglRenderer from '../renderer';
import defregl, { IDregl } from 'deferred-regl';

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
  onFrame?: FrameCallback

}

export class ReglFrame extends React.Component<ReglFrameProps, {}> {
  reglHandle?: any
  tick?: Cancellable
  canvasRef: HTMLCanvasElement | null = null
  fiberRoot?: FiberRoot
  initQueue: any[] = []
  legitRegl?: Regl
  deferredRegl?: IDregl

  static childContextTypes = {
    reactify: PropTypes.bool,
  }

  constructor(props: any){
    super(props);
    this.deferredRegl = defregl()
  }

  getChildContext(){
    return {
      reactify: true,
    }
  }

  componentWillUnmount(){
    if(!this.fiberRoot) {
      if(!this.deferredRegl) throw Error('failed to deferre regl')
      console.error('regl root node missing on component unmount?')
      this.deferredRegl.setQueue(this.initQueue.slice(0));
      if(this.tick) this.tick.cancel();
      if(this.legitRegl){
        this.legitRegl.destroy();
      }
      this.deferredRegl.setRegl();
    }else{
      ReglRenderer.updateContainer(null, this.fiberRoot, this, () => {
        if(!this.deferredRegl) throw Error('failed to deferre regl')
        this.deferredRegl.setQueue(this.initQueue.slice(0));
        if(this.tick) this.tick.cancel();
        if(this.legitRegl){
          this.legitRegl.destroy();
        }
        this.deferredRegl.setRegl();
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

    this.legitRegl = reglInit(initProps)

    if(this.props.forwardedRef) {
      //@ts-ignore
      this.props.forwardedRef.current = legitReglRef._gl.canvas
    }

    if(!this.deferredRegl) throw Error('failed to deferre regl')
    this.initQueue = this.deferredRegl.queue.slice(0);

    const node0 = new Node({id: 'react-regl-root', regl: this.legitRegl});
    const fiberRoot = ReglRenderer.createContainer(node0, false, false);

    if(!this.deferredRegl) throw Error('failed to deferre regl')
    this.deferredRegl.setRegl(this.legitRegl);
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

    // This is where children get mounted to root node
    // and DrawNode constructors called
    ReglRenderer.updateContainer(this.props.children, this.fiberRoot, this, () => {
      fiberRoot.containerInfo.render();
    });
    globalDeferredRegl.setRegl(this.legitRegl);

    if(this.props.onFrame && typeof this.props.onFrame === 'function'){
      this.tick = this.legitRegl.frame((context: any) => {
        if(this.props.onFrame) this.props.onFrame(context);
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
      console.log('Reglframe update!!!!!');
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
