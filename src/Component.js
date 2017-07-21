import Node from 'scene-tree';
import ReactUpdates from 'react-dom/lib/ReactUpdates';
import ContainerMixin from './ContainerMixin';
import ReactInstanceMap from 'react-dom/lib/ReactInstanceMap';
import PropTypes from 'prop-types';

class ReglComponent {
  constructor(element){
    this.node = null;
    this.subscriptions = null;
    this.listeners = null;
    this._mountImage = null;
    this._renderedChildren = null;
    this._currentElement = null;
    this._hostNode = null;
    this.construct(element);
  }

  construct(element) {
    this._currentElement = element;

    this.props = this._currentElement.props;
  }

  getHostNode(){
    return this.node;
  }

  getNativeNode() {
    return this.node;
  }

  getPublicInstance() {
    return this.node;
  }

  unmountComponent(){
    //debugger;
  }

  mountComponent(transaction, nativeParent, nativeContainerInfo, context) {    
    const nodeProps = {};

    this.node = Node(Object.assign({}, nodeProps, this._currentElement.props));
    this.node.type = this.constructor.name;
    
    delete this.node.data.children;

    const instance = ReactInstanceMap.get(this);

    let children;
    if(this.render && this._currentElement.props.children){
      children = this.render();
    }

    if(this.render && !this._currentElement.props.children){
      children = this.render();
    }
    
    if(!this.render && this._currentElement.props.children){
      children = this._currentElement.props.children;
    }    

    if(children){
      const transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
      transaction.perform(
        this.mountAndInjectChildren,
        this,
        children,
        transaction,
        context
      );
    }
    
    return this.node;
  }
  
  receiveComponent(nextComponent, transaction, context) {
    const nodeProps = {};

    Object.assign(this.node.data, nodeProps, this._currentElement.props, nextComponent.props);
    
    this._currentElement = nextComponent;
    this.props = nextComponent.props;

    let children;
    if(this.render && !this._currentElement.props.children){
      children = this.render();
    }
    
    if(!this.render && this._currentElement.props.children){
      children = this._currentElement.props.children;
    }

    if(children){
      const updateTrans = ReactUpdates.ReactReconcileTransaction.getPooled();
      updateTrans.perform(
        this.updateChildren,
        this,
        children,
        transaction,
        context
      );
    }

    return this.node;
  }

  static displayName = "ReglComponent";

  static contextTypes = {
    regl: PropTypes.func
  };

  static childContextTypes = {
    regl: PropTypes.func
  };
}

Object.assign(ReglComponent.prototype, ContainerMixin);


export default ReglComponent;
