import ReactFiberReconciler from 'react-reconciler';
import emptyObject from 'fbjs/lib/emptyObject';

import DrawNode from './nodes/DrawNode.js'
import Node from './nodes/Node.js';

/**
 * Lifecyle of the renderer
 */
const ReglRenderer = ReactFiberReconciler({
  now: () => { return Date.now() },

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

  mutation: {
    commitMount(
      domElement,
      type,
      newProps,
      internalInstanceHandle,
    ){
      //noop
      debugger;
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
      instance.executionProps = newProps;
      //instance.updateProps(oldProps, newProps);
    },


    /* resetTextContent(domElement) {
     *   domElement.textContent = '';
     * },

     * commitTextUpdate(
     *   textInstance,
     *   oldText,
     *   newText,
     * ){
     *   textInstance.nodeValue = newText;
     * },*/

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
      debugger;
      /* if (container.nodeType === COMMENT_NODE) {
       *   (container.parentNode: any).insertBefore(child, beforeChild);
       * } else {
       *   container.insertBefore(child, beforeChild);
       * }*/
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
      debugger;
      container.removeChild(child);
    },
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
    debugger;
    /* if (parentInstance.appendChild) {
     *   parentInstance.appendChild(child);
     * } else {
     *   parentInstance.document = child;
     * }*/
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
  getRootHostContext(root) {
    return root;
    //return emptyObject;
  },

  getChildHostContext(root) {
    return root
  },

  getPublicInstance(inst) {
    debugger;
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

  commitTextUpdate(textInstance, oldText, newText) {
    debugger;
    textInstance.chidren = newText;
  },

  mountIndeterminateComponent(){
    debugger;
  },

  useSyncScheduling: true,
});

export default ReglRenderer;
