import ReactFiberReconciler from 'react-reconciler';
import { unstable_now as now, unstable_scheduleCallback as scheduleCallback, unstable_cancelCallback as cancelCallback } from 'scheduler';
import DrawNode, { IDrawNodeProps } from './nodes/DrawNode'
import Node from './nodes/Node';


type RequestIdleCallbackHandle = any;
type RequestIdleCallbackOptions = {
  timeout: number;
};
type RequestIdleCallbackDeadline = {
  readonly didTimeout: boolean;
  timeRemaining: (() => number);
};

declare global {
  interface Window {
    requestIdleCallback: ((
      callback: ((deadline: RequestIdleCallbackDeadline) => void),
      opts?: RequestIdleCallbackOptions,
    ) => RequestIdleCallbackHandle);
    cancelIdleCallback: ((handle: RequestIdleCallbackHandle) => void);
  }
}


export default ReactFiberReconciler({
  supportsMutation: true,
  isPrimaryRenderer: false,
  supportsPersistence: false,
  supportsHydration: false,
  now,
//  scheduleDeferredCallback: window.requestIdleCallback,

  //this is not implmented in the type def but required
  //@ts-ignore
  clearContainer: function(rootNode: Node){
    rootNode.destroy();
  },

  commitMount: function(instance, type, newProps, internalInstanceHandle){
  },

  /**
   * Create component instance
   */
  createInstance(
    type: string,
    props: IDrawNodeProps,
    rootContainerInstance: any,
    hostContext: any
  ) {
    if(type === 'ReglDraw'){
      return new DrawNode(props as IDrawNodeProps, rootContainerInstance.regl);
    }

    return new Node(props);
  },

  appendChild(
    parentInstance: Node,
    child: Node,
  ){
    parentInstance.appendChild(child);
  },

  appendChildToContainer(
    container: Node,
    child: Node,
  ){
    container.appendChild(child);
  },

  insertBefore(
    parentInstance: Node,
    child: Node,
    beforeChild: Node,
  ){
    parentInstance.insertBefore(child, beforeChild);
  },

  removeChild(
    parentInstance: Node,
    child: Node,
  ){
    parentInstance.removeChild(child);
  },

  removeChildFromContainer(
    container: Node,
    child: Node,
  ){
    container.removeChild(child);
  },

  finalizeInitialChildren(){
    return true
  },

  prepareUpdate(
    instance: any,
    type,
    oldProps: any,
    newProps: any,
  ){
    if(
      instance.executionProps !== newProps.executionProps
    ){
      return newProps.executionProps;
    }

    return null;
  },

  commitUpdate(
    instance: any,
    updatePayload,
    type,
  ){
    instance.executionProps = updatePayload;
  },

  /**
   * Append the children. If children are wrapped inside a parent container, then push all the children
   * inside it else we create a property called `document` on a parent node and append all the childrens
   * to it and render them with `property_name.render()`.
   */
  appendInitialChild(parentInstance:Node, child:Node) {
    parentInstance.appendChild(child);
  },

  /**
   * Keeps track of the current location in tree
   */
  getRootHostContext(rootHostContext) {
    return rootHostContext;
  },

  getChildHostContext(parentHostContext) {
    return parentHostContext;
  },

  getPublicInstance(inst) {
    return inst;
  },

  cancelDeferredCallback(callbackID){
    return null;
  },

  /**
   * Disable callbacks during DOM manipulation
   */
  prepareForCommit() {
    // noop
    return null;
  },

  resetAfterCommit() {
    // noop
  },

  createTextInstance(
  ) {
    // Not sure what to do with text nodes it expects a node return
    throw new Error("Text nodes not supported as ReactRegl children");
  },

  shouldSetTextContent(){
    return false
  },

  shouldDeprioritizeSubtree(){
    return true;
  }
});
