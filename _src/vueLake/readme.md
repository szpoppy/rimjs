## rimjs/vueLake

- 它是 Vuejs 的一个插件，解决了 Vue 中非父子组件通讯的痛点；
- 它还可以使用在任意 JS 中，作为和 Vue 组件通讯的纽带；
- 利用订阅者和发布者模式来管理消息；
- 发布订阅类似koa2中的模式，需要通过next来运行下一个订阅。


## 更新日志

- [2020-09-07]出发异步支持，类似koa2的剥洋葱

## 功能

- 任意相对独立的 JS 之间的通讯（包括 Vue 组件以及 JS）
- 订阅需要初始化客户端，并且有自身的生命周期
- 当在 Vue lake 会自动注册，并将生命周期融合
- 全局监控支持（当监控到某个组件初始化后，会自动触发回调）

## API

### JS 中使用

```javascript
import Lake from "rimjs/vueLake"
let lake = new Lake({
    // 绑定的对象
    target: {},
    // 实例唯一ID
    id: "id",
    // 实例分组，可以多个 字符串数组表示
    group:"group"
})

// 消息订阅
lake.sub("instruct", async function({
    // emit时，第二个参数
    data,
    // 触发emit的实例
    from,
    // new 时，绑定的对象
    target
}, next) {
    // ...

    // 下一个
    await next()

    // 回溯代码...
})

// 取消订阅 instruct 并且 回调为 这个函数的
lake.unSub("instruct", fun)
// 取消 instruct 的全部订阅
lake.unSub("instruct")
// 取消全部和lake有关的订阅
lake.unSub()

// 消息发布 返回event 同 上面的回调参数
let event = lake.pub('instruct', data)

// 消息发布到指定id
let event = lake.pub('instruct#id', data)

// 消息发布到指定group
let event = lake.pub('instruct@group', data)

// 获取命名为 id 的lake
let that = Lake.getId('id')

// 获取分组 group
let thats = Lake.getGroup('name')

// 监控组件被命名为 id
lake.listen("#id", function(that){
    // that 命名为 id 的那个组件
    // ...
})
// 监控组件分组中包含 group
lake.listen("@group", function(that) {
    // ...
})

// 取消特定监控
lake.unListen("#id", fun)
lake.unListen("@group", fun)

// 取消指定所有监控
lake.unListen("#id")
lake.unListen("@group")

// 取消全部和lake有关的监控
lake.unListen()

```

### main.js 注册 Lake 插件

```javascript
import Vue from "vue"
import VueLake from "rimjs/vueLake"
// 非 cli 也必须 install一下 useProps 默认为 true，部分极端情况可以设置为false  例如：ant-design
Vue.use(VueLake, { useProps: true })
```

### Vue 组件内部使用

```javascript
{
    // 将这个组件归到group分组， 多个分组请使用字符串数组
    lakeName: 'group',
    // lake 是组件内部订阅消息设置的
    lakeSubs: {
        // 订阅消息 为 instruct
        async instruct (event, next) {
            // event 参数参照上面《JS中使用》中的on方法回调参数

            await next

            // ...

        }
    },
    method: {
        doExec () {
            // 发布订阅消息
            // instruct 本组件如果订阅，也能收到
            this.$lake("instruct", arg)

            // 获取被命名为 id的组件引用
            // that 为lake实例，that.target 为Vue的实例
            let that = this.$lake.id("id")

            // 获取分组为 group 的所有vue
            let thats = this.$lake.group("group")

            // 原始 lake 对象的指向，不介意直接操作
            this._lake_data_.self
        }
    }
}
```

### Vue 组件实例化传参

```html
<!-- 加入group分组 并且 将本组件命名为 id -->
<component lake-name="group" lake-id="id"></component>
<!-- 加入多个分组，请传入数组 -->
<component :lake-name="['group1', 'group2']"></component>
```

### 一个实例
```ts
import Lake from "../vueLake"

let lake = new Lake()

lake.sub("tt", function({ data }) {
    data.x = 1
})

lake.sub<{ y: number; z: number }>("tt", async function(this: Lake<void>, { data }, next) {
    data.y = 1

    await next()

    data.z = 100
})

lake.sub("tt", async function({ data }, next) {
    data.z = 2

    await next()

    data.z = 50
})

async function doExe() {
    // 输出 {data:{x:1, z: 1, y: 100}}
    console.log(await lake.pub("tt"))
}

doExe()

```