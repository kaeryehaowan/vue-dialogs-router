"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("./util");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _dialogMap = Symbol("_dialogMap");
var _getComponent = Symbol("_getComponent");
var _uid = Symbol("_uid");

var DialogRouter = function () {
  function DialogRouter() {
    var dialogMap = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, DialogRouter);

    this[_dialogMap] = dialogMap;
    this[_uid] = 1;
  }

  _createClass(DialogRouter, [{
    key: _getComponent,
    value: function value(name) {
      return this[_dialogMap][name];
    }
  }, {
    key: "getDialog",
    value: function getDialog(uid) {
      var dialogCompone = this._dialogComponents.find(function (i) {
        return i.uid == uid;
      });
      return dialogCompone && dialogCompone.dialogComponentInstance;
    }
  }, {
    key: "closeAll",
    value: function closeAll() {
      while (this._dialogComponents.length) {
        this._dialogComponents.pop();
      }
    }
  }, {
    key: "close",
    value: function close(uid) {
      var dialogCompone = this._dialogComponents.find(function (i) {
        return i.uid === uid;
      });
      if (dialogCompone) {
        var dialogComponentInstance = dialogCompone.dialogComponentInstance,
            key = dialogCompone.key;

        if (dialogComponentInstance) {
          var idx = this._dialogComponents.findIndex(function (i) {
            return i.uid === uid;
          });
          dialogComponentInstance[key] = false;
          this._dialogComponents.splice(idx, 1);
        }
      }
    }
  }, {
    key: "push",
    value: function push() {
      var _this2 = this;

      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$name = _ref.name,
          name = _ref$name === undefined ? "" : _ref$name,
          _ref$on = _ref.on,
          on = _ref$on === undefined ? {} : _ref$on,
          _ref$props = _ref.props,
          props = _ref$props === undefined ? {} : _ref$props;

      var callBack = arguments[1];

      var uid = parseInt(Math.random() * 999999).toString();
      var dialog = this[_getComponent](name);
      if (!dialog) {
        throw new Error("[vue-dialogs-router]: \u540D\u4E3A\"" + name + "\"\u7684 dialog \u7EC4\u4EF6\uFF0C\u672A\u627E\u5230\uFF0C\u8BF7\u68C0\u67E5\u3002");
      }
      if ((0, _util.isFn)(dialog)) {
        var promiseDialog = dialog();
        if (promiseDialog.then) {
          promiseDialog.then(function (component) {
            _this2._dialogComponents.push({
              name: name,
              on: on,
              props: props,
              uid: uid,
              component: component.default
            });
            if (callBack) {
              _this2.__root__.$nextTick().then(function () {
                callBack(_this2.getDialog(uid), uid);
              });
            }
          });
        }
      }
      if ((0, _util.isObject)(dialog)) {
        this._dialogComponents.push({
          name: name,
          on: on,
          props: props,
          uid: uid,
          component: dialog
        });
        if (callBack) {
          this.__root__.$nextTick().then(function () {
            callBack(_this2.getDialog(uid), uid);
          });
        }
      }
      return uid;
    }
  }]);

  return DialogRouter;
}();

DialogRouter.install = function (Vue) {
  var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref2$key = _ref2.key,
      key = _ref2$key === undefined ? "show" : _ref2$key;

  var root = null;
  Vue.mixin({
    beforeCreate: function beforeCreate() {
      if (this.$root.$options.dialogRouter) {
        if (this.$options.dialogRouter) {
          this.$dialogRouter = this.$options.dialogRouter;
          this.$dialogRouter.__root__ = this;
          root = this;
          Vue.util.defineReactive(this, "_dialogComponents", []);
        } else {
          this.$dialogRouter = this.$root.$dialogRouter;
          this.$dialogRouter.__root__ = this.$root;
        }
        this.$dialogRouter._dialogComponents = this.$root._dialogComponents;
      }
    },
    created: function created() {
      if (this.$vnode && this.$vnode.data && this.$vnode.data.uid) {
        var DialogComponent = this.$vnode.data.DialogComponent;
        this[key] = true;
        DialogComponent.dialogComponentInstance = this;
        DialogComponent.key = key;
        this.$watch(key, function (newVal) {
          if (!newVal) {
            var uid = DialogComponent.uid;
            root.$dialogRouter.close(uid);
          }
        });
      }
    },
    mounted: function mounted() {
      var _this3 = this;

      if (this.$options.dialogRouter && this.$root === this) {
        var _this = this;
        // 注入 root.$options ，需要排除 dialogRouter、各生命周期、各数据选项等，需要留下 router,store等
        var removeOptions = [
        // 数据类
        'data', 'props', 'propsData', 'computed', 'methods', 'watch',
        // DOM
        'el', 'template', 'render', 'renderError',
        // 生命周期钩子
        'beforeCreate', 'created', 'beforeMount', 'mounted', 'beforeUpdate', 'updated', 'activated', 'deactivated', 'beforeDestroy', 'destroyed', 'errorCaptured', 'beforeDestroy', 'beforeDestroy',
        // 资源
        'directives', 'filters', 'components',
        // 组合
        'parent', 'mixins', 'extends', 'provide', 'inject',
        // 其它
        'name', 'delimiters', 'functional', 'model', 'inheritAttrs', 'comments', '_base',
        // dialogRouter 防循环引用
        'dialogRouter'];
        var _rootOptions = {};
        Object.keys(this.$options).forEach(function (k) {
          if (!~removeOptions.indexOf(k)) {
            _rootOptions[k] = _this3.$options[k];
          }
        });
        Object.defineProperty(Vue.prototype, '$dialogRouter', {
          get: function get() {
            return root.$dialogRouter;
          }
        });
        var container = new Vue(Object.assign(_rootOptions, {
          router: this.$options.router,
          store: this.$options.store,
          render: function render(h) {
            var dialogList = _this.$root._dialogComponents;
            return h("div", {}, dialogList.map(function (DialogComponent) {
              return h(DialogComponent.component, {
                props: DialogComponent.props,
                on: DialogComponent.on,
                uid: DialogComponent.uid,
                DialogComponent: DialogComponent
              });
            }));
          }
        })).$mount();
        document.body.appendChild(container.$el);
      }
    }
  });
  Vue.directive("dialog", {
    bind: function bind(el, binding, vnode) {
      el.__dialogTo__ = binding.value;
      var eventName = binding.arg || "click";
      var modifiers = binding.modifiers;
      el.addEventListener(eventName, function (e) {
        if (modifiers.stop) {
          e.stopPropagation();
        }
        if (modifiers.prevent) {
          e.preventDefault();
        }
        vnode.context.$dialogRouter.push(el.__dialogTo__);
      });
    },
    componentUpdated: function componentUpdated(el, binding, vnode) {
      el.__dialogTo__ = binding.value;
    }
  });
};
exports.default = DialogRouter;