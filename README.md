## vue-vue-dialogs-router v0.3.1

dialog router，类 vue-router 的方式管理 dialog，类 component 的方式使用 dialog。

- 全局注册，统一管理。
- 可懒加载。
- 支持 props，callback。
- 可通过 uid（dialog 唯一返回值），获取到 dialogComponent 的组件实例。
- 可通过 uid 关闭指定的 dialog。
- 可通过 v-dialog 指令打开 dialog。
- v0.3.0增加了可以在 dialog实例页面里，调用 this.$dialogRouter 

## Installation

```js
npm i vue-dialogs-router -S
```

## Methods

| 方法      | 说明                                                                                                                                         | 参数                                                                                                                                                                                                                 |
|-----------|--------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| push      | 类似 vue-router 的 push，用来打开一个 dialog 组件。this.\$dialogRouter.push({name,props,on},callBack)                                          | name[type=String]为 dialogRouter 里注册时的 name 值，props[type=Object]为需要传入到 dialog 的属性，on[type=Object]为注册的 event；callBack 为打开 dialog 之后的回调，它有两个参数，一个为 dialogComponent 实例，一个为 uid |
| close     | 可通过 uid 来关闭 dialog。this.\$dialogRouter.close(uid)                                                                                      | uid 为 push 时返回的唯一值                                                                                                                                                                                           |
| closeAll  | 关闭全部 dialog                                                                                                                              | 无                                                                                                                                                                                                                   |
| getDialog | 用来获取 dialog 实例，这是一个同步方法，因为视图渲染 或 懒加载的原因，可能会无法获取到实例，需要自行把握调用时机，建议在 push callBack 里获取实例 | uid 为 push 时返回的唯一值                                                                                                                                                                                           |

## Notes

Vue.use(DialogRouter, {key: 'show'})，这里的 key 即为控制 dialog 是否显示的变量。默认为 show。dialog 组件里必须要有这个 key 

## Usage

```js
// main.js
import Vue from "vue";
import App from "./App.vue";
import dialogRouter from "./dialogRouter";

new Vue({
  router,
  dialogRouter,
  render: (h) => h(App),
}).$mount("#app");
```

```js
// dialogRouter.js
import Vue from "vue";
import DialogRouter from "vue-dialogs-router";
import dialog1 from "@/dialog/dialog-1.vue";
Vue.use(DialogRouter);
const dialogRouter = new DialogRouter({
  dia1: dialog1,
  dia2: () => import(/* webpackChunkName: "dialog" */ "@/dialog/dialog-2.vue"),
  dia3: () => import(/* webpackChunkName: "dialog" */ "@/dialog/dialog-3.vue"),
});
export default dialogRouter;
```

```vue
// page.vue
<template>
  <div>
    <button v-dialog:click="{ name: 'dia3' }">打开 dialog</button>
  </div>
</template>
<script>
export default {
    mounted(){
        // dia1
        this.$dialogRouter.push({
            name: "dia1",
            props: {
                name: "kael",
                age: 100,
                sex: "男",
                list: [1, 2, 3],
            },
            on: {
                callback: (data) => {
                    console.log(data);
                },
            },
        });

        // dia2
        dialog2() {
            this.uid = this.$dialogRouter.push(
                {
                    name: "dia2",
                },
                (instance, uid) => {
                    // 在回调里操作实例
                    console.log(instance);
                    console.log(uid);
                    setTimeout(() => {
                        instance.name = "外部修改";
                    }, 2000);
                }
            );
            // 调用 this.$dialogRouter.close(uid) 关闭 dialog
            setTimeout(()=>{
                this.$dialogRouter.close(this.uid)
            }, 4000)
        },
    }
}
</script>
```

```vue
<template>
  <el-dialog :visible.sync="show" title="dialog3">
    这是通过 v-dialog 打开的 dialog
  </el-dialog>
</template>

<script>
export default {
  name: "dialog_3",
  data() {
    return {
      show: false,
    };
  },
};
</script>
```
