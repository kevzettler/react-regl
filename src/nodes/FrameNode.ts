import { FrameCallback } from 'regl'
import Node, {IBaseNodeProps} from './Node'
import regl from '../'


export interface IFrameNodeProps extends IBaseNodeProps{
  onFrame: FrameCallback
}

export default class FrameNode extends Node{
  constructor(props: IFrameNodeProps){
    super(props);
    regl.frame((...args) => {
        props.onFrame(...args);
        this.render();
    })
  }
}
