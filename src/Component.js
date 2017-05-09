import Node from 'display-tree';
import ReactUpdates from 'react-dom/lib/ReactUpdates';
import ContainerMixin from './ContainerMixin';
import ReactInstanceMap from 'react-dom/lib/ReactInstanceMap';

export default class ReglComponent {
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

    //Oh shit how to update?
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
    
    if(this.drawCommand){
      //Cache the regl renderer for this component on context
      //TODO more efficent hash than BASE64?    
      const rendererKey = btoa(this.drawCommand.toString());
      if(!context.regl.renderers[rendererKey]){
        context.regl.renderers[rendererKey] = this.drawCommand(context.regl);
      }

      nodeProps.drawCommand = context.regl.renderers[rendererKey];
    }

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
    
    if(this.drawCommand){
      //Cache the regl renderer for this component on context
      //TODO more efficent hash than BASE64?    
      const rendererKey = btoa(this.drawCommand.toString());
      if(!context.regl.renderers[rendererKey]){
        context.regl.renderers[rendererKey] = this.drawCommand(context.regl);
      }

      nodeProps.drawCommand = context.regl.renderers[rendererKey];
    }    
    
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
}

Object.assign(ReglComponent.prototype, ContainerMixin);
ReglComponent.displayName = "ReglComponent";
