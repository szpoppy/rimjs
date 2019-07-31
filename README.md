

<p align="center">
   <a href="https://www.npmjs.com/package/vue-unicom">
   		<img src="https://img.shields.io/npm/v/vue-unicom.svg?style=flat" alt="npm">
   </a>
   <a href="https://www.npmjs.com/package/vue-unicom">
   		<img src="https://img.shields.io/npm/dm/vue-unicom.svg?style=flat" alt="npm">
   </a>
</p>

## vue-unicom
* 它是Vuejs的一个插件，解决了Vue中非父子组件通讯的痛点。
* 它还可以使用在任意JS中，作为和Vue组件通讯的纽带
* 利用订阅者和发布者模式来管理消息


## 更新日志
* [2019-07-30]重构vue-unicom，重构后代码逻辑更清晰
* [2019-07-31]优化注解，修复全局订阅问题以及一些多余代码删除

## 功能  
* 任意相对独立的JS之间的通讯（包括Vue组件以及JS）
* 订阅需要初始化客户端，并且有自身的生命周期
* 当在Vue组件内，unicom会自动注册，并将生命周期融合
* 全局监控支持（当监控到某个组件初始化后，会自动触发回调）


## 运行demo
- npm install
- npm install gulp -g   (安装过可以忽略)
- gulp
- 浏览器中输入http://127.0.0.1:3101 (PC)
- 浏览器中输入http://ip:3101 (手机浏览器)
- 实例访问： https://szpoppy.github.io/vue-unicom/dist/index.html
- vue-cli demo: https://github.com/szpoppy/vue-unicom-demo

## 获取vue-unicom
- npm i vue-unicom -S
- github下载zip包，dist/lib/unicom.js，可以直接引入 到页面

## API  
### JS中使用  

````javascript
let unicom = new Unicom({
    // 绑定的对象
    target: {},
    // 实例唯一ID
    id: "id",
    // 实例分组，可以多个 字符串数组表示
    group:"group"
})

// 消息订阅
unicom.on("instruct", function({
    // emit时，第二个参数
    data,
    $1,
    // emit时，第三个参数，依次类推
    $2,
    // 触发emit的实例
    from,
    // new 时，绑定的对象
    target
}) {
    // ...
})

// 取消订阅 instruct 并且 回调为 这个函数的
unicom.off("instruct", fun)
// 取消 instruct 的全部订阅
unicom.off("instruct")
// 取消全部和unicom有关的订阅
unicom.off()

// 消息发布 返回event 同 上面的回调参数
let event = unicom.emit('instruct', arg1, arg2, ...)

// 消息发布到指定id
let event = unicom.emit('instruct#id', arg1, arg2, ...)

// 消息发布到指定group
let event = unicom.emit('instruct@group', arg1, arg2, ...)

// 获取命名为 id 的unicom
let that = unicom.emit('#id')

// 获取分组 group 
let thats = unicom.emit('@group')

// 监控组件被命名为 id
unicom.monitor("#id", function(that){
    // that 命名为 id 的那个组件
    // ...
})
// 监控组件分组中包含 group
unicom.monitor("@group", function(that) {
    // ...
})

// 取消特定监控
unicom.monitorOff("#id", fun)
unicom.monitorOff("@group", fun)

// 取消指定所有监控
unicom.monitorOff("#id")
unicom.monitorOff("@group")

// 取消全部和unicom有关的监控
unicom.monitorOff()

````

### main.js 注册Unicom插件
````javascript
import Vue from 'vue'
import VueUnicom from 'vue-unicom'
// 非 cli 也必须 install一下
Vue.use(VueUnicom, {
    // 制定名称， 默认为 unicom
    unicom: 'unicom'，
    // 定制分组使用名称 默认为 unicom + 'Name'
    unicomName: 'unicomName',
    // 定制id使用名称 默认为 unicom + 'Id'
    unicomId: 'unicomId',
    // 定制vue中，发布emit方法， this['$' + unicomEmit] 默认为 unicom参数
    unicomEmit: 'unicom',
    // 定制 Vue中，全局访问的类名 默认为  unicom 参数，并将第一个字母大写
    unicomClass: 'Unicom'
})
````

### 其他关联JS中使用
````javascript
// 提供 main.js 安装的插件
export default function install(Vue) {
    // 通过 Vue.Unicom 获取类
    let unicom = new Vue.Unicom()

    // 其他操作 参照 JS中使用方案
}
````

### Vue组件内部使用
````javascript
{
    // 将这个组件归到group分组， 多个分组请使用字符串数组
    unicomName: 'group',
    // unicom 是组件内部订阅消息设置的
    unicom: {
        // 订阅消息 为 instruct
        instruct (event) {
            // event 参数参照上面《JS中使用》中的on方法回调参数
        }
    },
    method: {
        doExec () {
            // 发布订阅消息
            // instruct 本组件如果订阅，也能收到
            this.$unicom("instruct", arg1, arg2, ...)

            // 获取被命名为 id的组件引用
            // that 为unicom实例，that.target 为Vue的实例
            let that = this.$unicom("#id")

            // 获取分组为 group 的所有vue
            let thats = this.$unicom("@group")

            // 原始 unicom 对象的指向，不介意直接操作
            this._unicom_data_.self
        }
    }
}
````

### Vue组件实例化传参
````html
<!-- 加入group分组 并且 将本组件命名为 id -->
<component unicom-name="group" unicom-id="id"></component>
<!-- 加入多个分组，请传入数组 -->
<component :unicom-name="['group1', 'group2']"></component>
````