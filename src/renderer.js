import ReactFiberReconciler from 'react-reconciler';
import invariant from 'fbjs/lib/invariant';
import { unstable_now as now, unstable_scheduleCallback as scheduleCallback, unstable_cancelCallback as cancelCallback } from 'scheduler';

import DrawNode from './nodes/DrawNode.js'
import Node from './nodes/Node.js';


export default ReactFiberReconciler({
  now,
  schedulePassiveEffects: scheduleCallback,
  cancelPassiveEffects: cancelCallback,
  supportsMutation: true,
  scheduleDeferredCallback: window.requestIdleCallback,

  /**
   * Create component instance
   */
  createInstance(
    type,
    props,
    rootContainerInstance,
    hostContext,
    internalInstanceHandle,
  ) {
    if(type === 'Draw'){
      return new DrawNode(props, hostContext.regl);
    }

    return new Node(props, hostContext.regl);
  },

  commitMount(domElement, type, newProps, internalInstanceHandle,){
    //noop
  },

  commitUpdate(
    instance,
    updatePayload,
    type,
    oldProps,
    newProps,
    internalInstanceHandle,
  ){
    //TODO update the drawNodes props
    // regenerate the instances draw command if the shaders have changed
    // If the executionProps change just redraw
    // if the definitionProps change need to re init the drawCall
    //instance.executionProps = newProps;
    if(instance.updateProps){
      instance.updateProps(oldProps, newProps);
    }
  },


  resetTextContent(domElement) {
    domElement.textContent = '';
  },

  commitTextUpdate(
    textInstance,
    oldText,
    newText,
  ){
    textInstance.nodeValue = newText;
  },

  appendChild(
    parentInstance,
    child,
  ){
    parentInstance.appendChild(child);
  },

  appendChildToContainer(
    container,
    child,
  ){
    container.appendChild(child);
  },

  insertBefore(
    parentInstance,
    child,
    beforeChild,
  ){
    parentInstance.insertBefore(child, beforeChild);
  },

  insertInContainerBefore(
    container,
    child,
    beforeChild,
  ){
  },

  removeChild(
    parentInstance,
    child,
  ){
    parentInstance.removeChild(child);
  },

  removeChildFromContainer(
    container,
    child,
  ){
    container.removeChild(child);
  },

  /**
   * Append the children. If children are wrapped inside a parent container, then push all the children
   * inside it else we create a property called `document` on a parent node and append all the childrens
   * to it and render them with `property_name.render()`.
   */
  appendInitialChild(parentInstance, child) {
    parentInstance.appendChild(child);
    /* if (parentInstance.appendChild) {
     *   parentInstance.appendChild(child);
     * } else {
     *   parentInstance.document = child;
     * }*/
  },

  appendChild(parentInstance, child) {
    parentInstance.appendChild(child);
  },

  removeChild(parentInstance, child) {
    parentInstance.removeChild(child);
  },

  insertBefore(parentInstance, child, beforeChild) {
    debugger;
    // noob
  },

  /**
   * Final call / check before flushing to the host environment
   */
  finalizeInitialChildren(testElement, type, props, rootContainerInstance) {
    return false;
  },

  /**
   * Prepare the update with new props
   */
  prepareUpdate(instance, type, oldProps, newProps, hostContext) {
    return true;
  },

  commitMount(
    instance,
    type,
    newProps,
    rootContainerInstance,
    internalInstanceHandle,
  ) {
    debugger;
    // noop
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

  getChildHostContextForEventComponent(context){
    return context;
  },

  getChildHostContextForEventTarget(context){
    return context;
  },

  getPublicInstance(inst) {
    return inst;
  },

  /**
   * Disable callbacks during DOM manipulation
   */
  prepareForCommit() {
    // noop
  },

  resetAfterCommit() {
    // noop
  },

  shouldSetTextContent(props) {
    return false;
  },

  shouldDeprioritizeubtree(){
    return false;
  },

  resetTextContent(testElement) {
    // noop
  },

  createTextInstance(
    text,
    rootContainerInstance,
    hostContext,
    internalInstanceHandle,
  ) {
    return text;
  },

  scheduleTimeout(){

  },

  commitTextUpdate(textInstance, oldText, newText) {
  },

  mountIndeterminateComponent(){
  },
});
