import ReactMultiChild from 'react-dom/lib/ReactMultiChild';


function injectAfter(parentNode, referenceNode, node) {
  /* if (referenceNode === null) {
   *   parentNode.insertFirst(node);
   * } else {
   *   parentNode.insertAfter(referenceNode, node);
   * }*/
}

const ContainerMixin = {
  moveChild(child, afterNode, toIndex, lastIndex) {    
    const childNode = child._mountImage;
    injectAfter(this.node, afterNode, childNode);
  },

  createChild(child, afterNode, childNode) {
    child._mountImage = childNode;
    injectAfter(this.node, afterNode, childNode);
  },

  removeChild(child) {
    const childNode = child._mountImage;
    child._mountImage = null;
    this.node.remove(childNode);
  },

  updateChildrenAtRoot(nextChildren, transaction) {
    this.updateChildren(nextChildren, transaction, {});
  },

  mountAndInjectChildrenAtRoot(children, transaction) {
    this.mountAndInjectChildren(children, transaction, {});
  },

  updateChildren(nextChildren, transaction, context) {
    this._updateChildren(nextChildren, transaction, context);
  },

  mountAndInjectChildren(children, transaction, context) {
    const mountedImages = this.mountChildren(
      children,
      transaction,
      context
    );

    let i = 0;
    for (let key in this._renderedChildren) {
      if (this._renderedChildren.hasOwnProperty(key)) {
        const child = this._renderedChildren[key];
        child._mountImage = mountedImages[i];
        this.node.add(mountedImages);
        i++;
      }
    }
    
  }
};

export default Object.assign(ReactMultiChild.Mixin, ContainerMixin);
