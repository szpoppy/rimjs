

<p align="center">
   <a href="https://www.npmjs.com/package/vue-unicom">
   		<img src="https://img.shields.io/npm/v/vue-unicom.svg?style=flat" alt="npm">
   </a>
   <a href="https://www.npmjs.com/package/vue-unicom">
   		<img src="https://img.shields.io/npm/dm/vue-unicom.svg?style=flat" alt="npm">
   </a>
</p>
 


## vue-unicom

vue-unicom是一个Vue.js的一个组件。解决了Vue中组件通讯的痛点。利用事件总线原理，实现了任意Vue组件之间的通讯。


## 功能

- 提供任意两个Vue组建之间的通讯问题；
- 任意一个Vue组件向其他所有组件发送指令；
- 任意一个Vue组件向某组Vue组件发送指令；
- 任意一个Vue组件向特定id组件发送消息；
- 在任意一个Vue组件内获取某组组件列表；
- 在任意一个Vue组件内获取特定id组件；
- 发送指令到还没初始化的组件；
- 发送指令到还没初始化的分组组件；
- 发送指令到还没初始化的id组件；



## 更新记录

* unicom 联通 想到中国联通就想到了这个名字
* 目的，提供vue 全局的转发机制
* [2018-01-18] 增加分组， 可以直接获取分组的 vm
* [2018-01-25] 增加 unicom-id，确定vm的唯一值
* [2018-02-07] 增加 ～ 表示，发送到还没创建的组件，目标组件创建的时候，会在created，收到unicom事件
  - ~后面为空（不包含@#...）, 当目标组件被创建的时候，就会调用第二个函数参数
* [2018-02-08] 在实例组件时，也可以设置分组 unicom-name
* [2018-04-11] 去除 EventEmitter， 优化事件总线


## 运行demo
- npm install
- npm install gulp -g   (安装过可以忽略)
- gulp
- 浏览器中输入http://127.0.0.1:3101 (PC)
- 浏览器中输入http://ip:3101 (手机浏览器)
- demo中无，延后指令发送实例
- 实例访问： https://szpoppy.github.io/vue-unicom/dist/index.html

## 获取vue-unicom
- npm install vue-unicom
- github下载zip包，dist/lib/unicom.js，可以直接引入 到页面


## 使用，注册组件
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
    unicomId: 'unicomId'
})
````

## 注册接收指令
````javascript
{
    // Vue中增加 增加unicom参数
    // 这里的unicom，指 上面传入的参数
    unicom: {
        // instruct1：通讯指令
        // sender：发送指令者（$vm）
        // args：指令发出者附带参数
        // 参数如果为对象，是引用类型，如果需要设置，请深度克隆一遍
        instruct1 (sender, ...args) {
            // .... this 为当前组件
        },
        instruct2 (sender, ...args) {

        }
    }
}
````

## 组件内注册分组
````javascript
{
    // Vue中增加 增加unicomName参数
    // 指定分组 属于 group， 所有实例，都属于这个分组
    unicomName: 'group'
}
````


## 组件加入多个分组
````javascript
{
    // 组件可以加入多个分组
    unicomName: ['group1'， 'group2']
}
````


## 实例中加入组件分组
````html
<!-- 加入group分组 -->
<component unicom-name="group"></component>
````


## 实例中指定 unicomId
````html
<!-- 指定$vm的 id 为 id1 -->
<component unicom-id="id1"></component>
````


## 组件内发送指令
````javascript
{
    methods:{
        method1 () {
            // 发送 instruct1 指令，参数为 1， 2
            this.$unicom('instruct1', 1, 2)
        }
    }
}
````

## 指令高级用法

> instruct1@group   (发送到指定分组)

> instruct1#id1     (发送到指定组件)

> @group            （获取指定分组组件）

> \#id1             （获取指定组件）



## 延迟发送指令（一次性指令）

指令使用 ~ 打头

> \~instruct1       （指令延迟发送，直到包含有instruct1指令的组件出现）

> \~instruct1@group （指令延迟发送，直到出现分组命名group的组件）

> \~instruct1#id1   （指令延迟发送，直到出现命名id1的组件）



## 组件监听

组件监听使用, 指令使用 ~ 打头， 第二个参数为 callback 

> ～@group          （监听分组命名group的组件出现）

> ～#id1            （监听命名id1的组件出现）

> ～                （监听任意新出现的组件）