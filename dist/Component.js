'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _displayTree = require('display-tree');

var _displayTree2 = _interopRequireDefault(_displayTree);

var _ReactUpdates = require('react-dom/lib/ReactUpdates');

var _ReactUpdates2 = _interopRequireDefault(_ReactUpdates);

var _ContainerMixin = require('./ContainerMixin');

var _ContainerMixin2 = _interopRequireDefault(_ContainerMixin);

var _ReactInstanceMap = require('react-dom/lib/ReactInstanceMap');

var _ReactInstanceMap2 = _interopRequireDefault(_ReactInstanceMap);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ReglComponent = function () {
  function ReglComponent(element) {
    _classCallCheck(this, ReglComponent);

    this.node = null;
    this.subscriptions = null;
    this.listeners = null;
    this._mountImage = null;
    this._renderedChildren = null;
    this._currentElement = null;
    this._hostNode = null;
    this.construct(element);
  }

  _createClass(ReglComponent, [{
    key: 'construct',
    value: function construct(element) {
      this._currentElement = element;

      //Oh shit how to update?
      this.props = this._currentElement.props;
    }
  }, {
    key: 'getHostNode',
    value: function getHostNode() {
      return this.node;
    }
  }, {
    key: 'getNativeNode',
    value: function getNativeNode() {
      return this.node;
    }
  }, {
    key: 'getPublicInstance',
    value: function getPublicInstance() {
      return this.node;
    }
  }, {
    key: 'unmountComponent',
    value: function unmountComponent() {
      //debugger;
    }
  }, {
    key: 'mountComponent',
    value: function mountComponent(transaction, nativeParent, nativeContainerInfo, context) {
      var nodeProps = {};

      if (this.drawCommand) {
        //Cache the regl renderer for this component on context
        //TODO more efficent hash than BASE64?    
        var rendererKey = btoa(this.drawCommand.toString());
        if (!context.regl.renderers[rendererKey]) {
          context.regl.renderers[rendererKey] = this.drawCommand(context.regl);
        }

        nodeProps.drawCommand = context.regl.renderers[rendererKey];
      }

      this.node = (0, _displayTree2.default)(Object.assign({}, nodeProps, this._currentElement.props));
      this.node.type = this.constructor.name;

      delete this.node.data.children;

      var instance = _ReactInstanceMap2.default.get(this);

      var children = void 0;
      if (this.render && this._currentElement.props.children) {
        children = this.render();
      }

      if (this.render && !this._currentElement.props.children) {
        children = this.render();
      }

      if (!this.render && this._currentElement.props.children) {
        children = this._currentElement.props.children;
      }

      if (children) {
        var _transaction = _ReactUpdates2.default.ReactReconcileTransaction.getPooled();
        _transaction.perform(this.mountAndInjectChildren, this, children, _transaction, context);
      }

      return this.node;
    }
  }, {
    key: 'receiveComponent',
    value: function receiveComponent(nextComponent, transaction, context) {
      var nodeProps = {};

      if (this.drawCommand) {
        //Cache the regl renderer for this component on context
        //TODO more efficent hash than BASE64?    
        var rendererKey = btoa(this.drawCommand.toString());
        if (!context.regl.renderers[rendererKey]) {
          context.regl.renderers[rendererKey] = this.drawCommand(context.regl);
        }

        nodeProps.drawCommand = context.regl.renderers[rendererKey];
      }

      Object.assign(this.node.data, nodeProps, this._currentElement.props, nextComponent.props);
      this._currentElement = nextComponent;
      this.props = nextComponent.props;

      var children = void 0;
      if (this.render && !this._currentElement.props.children) {
        children = this.render();
      }

      if (!this.render && this._currentElement.props.children) {
        children = this._currentElement.props.children;
      }

      if (children) {
        var updateTrans = _ReactUpdates2.default.ReactReconcileTransaction.getPooled();
        updateTrans.perform(this.updateChildren, this, children, transaction, context);
      }

      return this.node;
    }
  }]);

  return ReglComponent;
}();

ReglComponent.displayName = "ReglComponent";
ReglComponent.contextTypes = {
  regl: _propTypes2.default.func
};
ReglComponent.childContextTypes = {
  regl: _propTypes2.default.func
};


Object.assign(ReglComponent.prototype, _ContainerMixin2.default);

exports.default = ReglComponent;