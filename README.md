## vue-unicom
- 提供任意两个Vue组建之间的通讯问题
- 任意一个Vue组件向其他所有组件发送指令
- 任意一个Vue组件向某组Vue组件发送指令
- 任意一个Vue组件向特定id组件发送消息
- 在任意一个Vue组件内获取某组组件列表
- 在任意一个Vue组件内获取特定id组件
- 可以发送指令到还没初始化的组件
- 可以发送指令到还没初始化的分组组件
- 可以发送指令到还没初始化的id组件

## 更新记录
* unicom 联通 想到中国联通就想到了这个名字 -_-
* 目的，提供vue 全局的转发机制
* [2018-01-18] 增加分组， 可以直接获取分组的 vm
* [2018-01-25] 增加 unicom-id，确定vm的唯一值
* [2018-02-07] 增加 ～ 表示，发送到还没创建的组件，目标组件创建的时候，会在created，收到unicom事件
    * ~后面为空（不包含@#...）, 当目标组件被创建的时候，就会调用第二个函数参数
* [2018-02-08] 在实例组件时，也可以设置分组 unicom-name

## 运行demo
- npm install
- npm install gulp -g   (安装过可以忽略)
- gulp
- 浏览器中输入http://127.0.0.1:3101 (PC)
- 浏览器中输入http://ip:3101 (手机浏览器)
- demo中无，延后指令发送实例

## API

### 使用 
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

### 注册接收指令
````javascript
{
    // Vue中增加 增加unicom参数
    // 这里的unicom，指 上面传入的参数
    [unicom]: {
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

### 组件内注册分组
````javascript
{
    // Vue中增加 增加unicomName参数
    // 指定分组 属于 group， 所有实例，都属于这个分组
    [unicomName]: 'group'
}

{
    // 组件可以加入多个分组
    [unicomName]: ['group1'， 'group2']
}
````

### 实例中加入组件分组
````html
<!-- 加入group分组 -->
<component [unicomName]="group"></component>

<!-- 加入group1、group2分组 -->
<component :[unicomName]="['group1', 'group2']"></component>

````

### 实例中指定id
````html
<!-- 指定$vm的 id 为 id1 -->
<component [unicomId]="id1"></component>
````

### 发送指令
````javascript
// 向所有组件发送 instruct1 指令
$vm['$' + unicom]('instruct1', arg1, arg2)
// 向分组为 group 发送 instruct1 指令
$vm['$' + unicom]('instruct1@group', arg1, arg2)
// 向命名为id1发送 instruct1 指令
$vm['$' + unicom]('instruct1#id1', arg1, arg2)

// 向所有组件发送 instruct1 指令 (延后发送，直到包含instruct1指令的组件创建)
$vm['$' + unicom]('～instruct1', arg1, arg2)
// 向所有组件发送 instruct1 指令 (延后发送，直到包含分组为group的组件被创建)
$vm['$' + unicom]('～instruct1@group', arg1, arg2)
// 向所有组件发送 instruct1 指令 (延后发送，直到命名为id1的组件被创建)
$vm['$' + unicom]('～instruct1#id1', arg1, arg2)

// 当之后，有组件创建的时候，会出发callback回调
$vm['$' + unicom]('～', callback)
// 当之后，有包含instruct1指令的组件创建的时候，会出发callback回调
$vm['$' + unicom]('～instruct1', callback)
// 当之后，有包含分组为group的组件被创建的时候，会出发callback回调
$vm['$' + unicom]('～@group', callback)
// 当之后，有命名为id1的组件被创建的时候，会出发callback回调
$vm['$' + unicom]('～#id1', callback)

// 获取分组为 group的组件数组
$vm['$' + unicom]('@group')
// 获取命名为id1的组件
$vm['$' + unicom]('#id1')

````