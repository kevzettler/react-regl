'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _regl = require('regl');

var _regl2 = _interopRequireDefault(_regl);

var _ReactUpdates = require('react-dom/lib/ReactUpdates');

var _ReactUpdates2 = _interopRequireDefault(_ReactUpdates);

var _ReactInstanceMap = require('react-dom/lib/ReactInstanceMap');

var _ReactInstanceMap2 = _interopRequireDefault(_ReactInstanceMap);

var _ContainerMixin = require('./ContainerMixin');

var _ContainerMixin2 = _interopRequireDefault(_ContainerMixin);

var _displayTree = require('display-tree');

var _displayTree2 = _interopRequireDefault(_displayTree);

var _batchChildren = require('./util/batchChildren');

var _batchChildren2 = _interopRequireDefault(_batchChildren);

var _topDownDrawScopes = require('./util/topDownDrawScopes');

var _topDownDrawScopes2 = _interopRequireDefault(_topDownDrawScopes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Regl = function (_Component) {
  _inherits(Regl, _Component);

  function Regl(props, context) {
    _classCallCheck(this, Regl);

    var _this = _possibleConstructorReturn(this, (Regl.__proto__ || Object.getPrototypeOf(Regl)).call(this, props, context));

    _this.state = {
      width: props.width || window.innerWidth,
      height: props.height || window.innerHeight
    };
    return _this;
  }

  _createClass(Regl, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._debugID = this._reactInternalInstance._debugID;

      this.node = (0, _displayTree2.default)();
      this.node.type = "Regl";

      var canvasRef = this.props.canvas || this.refs.canvas;

      var regl = (0, _regl2.default)(canvasRef);
      regl.renderers = {};
      this.regl = regl;

      if (this.props.onFrame) {
        regl.frame(this.props.onFrame);
      }

      var transaction = _ReactUpdates2.default.ReactReconcileTransaction.getPooled();
      transaction.perform(this.mountAndInjectChildren, this, this.props.children, transaction, Object.assign({}, _ReactInstanceMap2.default.get(this)._context, { regl: regl }));

      _ReactUpdates2.default.ReactReconcileTransaction.release(transaction);

      this.drawScope = (0, _topDownDrawScopes2.default)(this.node);
      this.drawScope();
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(oldProps) {
      var transaction = _ReactUpdates2.default.ReactReconcileTransaction.getPooled();
      transaction.perform(this.updateChildren, this, this.props.children, transaction, Object.assign({}, _ReactInstanceMap2.default.get(this)._context, { regl: this.regl }));
      _ReactUpdates2.default.ReactReconcileTransaction.release(transaction);

      if (this.props.clear) {
        this.regl.clear(this.props.clear);
      }

      this.drawScope();
    }
  }, {
    key: 'render',
    value: function render() {
      if (this.props.canvas) {
        return null;
      }

      var _state = this.state,
          width = _state.width,
          height = _state.height;

      return _react2.default.createElement('canvas', { ref: 'canvas', width: width, height: height });
    }
  }]);

  return Regl;
}(_react.Component);

Object.assign(Regl.prototype, _ContainerMixin2.default);
exports.default = Regl;