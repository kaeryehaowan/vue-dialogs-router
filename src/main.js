const _dialogMap = Symbol("_dialogMap");
const _getComponent = Symbol("_getComponent");
let _uid = Symbol("_uid");
import { isFn, isObject } from "./util";
class DialogRouter {
  constructor(dialogMap = {}) {
    this[_dialogMap] = dialogMap;
    this[_uid] = 1;
  }
  [_getComponent](name) {
    return this[_dialogMap][name];
  }
  getDialog(uid) {
    let dialogCompone = this._dialogComponents.find((i) => i.uid == uid);
    return dialogCompone && dialogCompone.dialogComponentInstance;
  }
  closeAll() {
    while (this._dialogComponents.length) {
      this._dialogComponents.pop();
    }
  }
  close(uid) {
    let dialogCompone = this._dialogComponents.find((i) => i.uid === uid);
    if (dialogCompone) {
      const { dialogComponentInstance, key } = dialogCompone;
      if (dialogComponentInstance) {
        const idx = this._dialogComponents.findIndex((i) => i.uid === uid);
        dialogComponentInstance[key] = false;
        this._dialogComponents.splice(idx, 1);
      }
    }
  }
  push({ name = "", on = {}, props = {} } = {}, callBack) {
    const uid = parseInt(Math.random() * 999999).toString();
    let dialog = this[_getComponent](name);
    if (!dialog) {
      throw new Error(
        `[vue-dialogs-router]: 名为"${name}"的 dialog 组件，未找到，请检查。`
      );
    }
    if (isFn(dialog)) {
      const promiseDialog = dialog();
      if (promiseDialog.then) {
        promiseDialog.then((component) => {
          this._dialogComponents.push({
            name,
            on,
            props,
            uid,
            component: component.default,
          });
          if (callBack) {
            this.__root__.$nextTick().then(() => {
              callBack(this.getDialog(uid), uid);
            });
          }
        });
      }
    }
    if (isObject(dialog)) {
      this._dialogComponents.push({
        name,
        on,
        props,
        uid,
        component: dialog,
      });
      if (callBack) {
        this.__root__.$nextTick().then(() => {
          callBack(this.getDialog(uid), uid);
        });
      }
    }
    return uid;
  }
}
DialogRouter.install = function (Vue, { key = "show" } = {}) {
  let root = null;
  Vue.mixin({
    beforeCreate() {
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
    created() {
      if (this.$vnode && this.$vnode.data && this.$vnode.data.uid) {
        const DialogComponent = this.$vnode.data.DialogComponent;
        this[key] = true;
        DialogComponent.dialogComponentInstance = this;
        DialogComponent.key = key;
        this.$watch(key, (newVal) => {
          if (!newVal) {
            const uid = DialogComponent.uid;
            root.$dialogRouter.close(uid);
          }
        });
      }
    },
    mounted() {
      if (this.$options.dialogRouter && this.$root === this) {
        let _this = this;
        const container = new Vue({
          render(h) {
            const dialogList = _this.$root._dialogComponents;
            return h(
              "div",
              {},
              dialogList.map((DialogComponent) => {
                return h(DialogComponent.component, {
                  props: DialogComponent.props,
                  on: DialogComponent.on,
                  uid: DialogComponent.uid,
                  DialogComponent,
                });
              })
            );
          },
        }).$mount();
        document.body.appendChild(container.$el);
      }
    },
  });
  Vue.directive("dialog", {
    bind(el, binding, vnode) {
      el.__dialogTo__ = binding.value;
      const eventName = binding.arg || "click";
      const modifiers = binding.modifiers;
      el.addEventListener(eventName, (e) => {
        if (modifiers.stop) {
          e.stopPropagation();
        }
        if (modifiers.prevent) {
          e.preventDefault();
        }
        vnode.context.$dialogRouter.push(el.__dialogTo__);
      });
    },
    componentUpdated(el, binding, vnode) {
      el.__dialogTo__ = binding.value;
    },
  });
};
export default DialogRouter;
