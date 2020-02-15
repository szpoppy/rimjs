# rimjs/vueFn

-   外挂方式
-   提供另一种方式的函数式方式写 vue 代码
-   与 vue-funciton-api 不冲突 -\_-

## 先来一段简单代码

```html
<template>
    <div></div>
</template>
<style></style>
<script>
    import vueExecFun from "rimjs/vueFn"
    let {..., $export} = vueExecFun()
    ...

    // 直接输出
    export default $export()
    export default $export

    // 异步输出
    export default $export(function(reolve){
        // 异步代码
        reolve()
    })
</script>
```

## API

### 最终返回的值

`$set(vueOptions)`

-   将 vueOptions 合并入 vue 的 options 参数

### 生成 name

`$name(name:string)`

-   同 vueOptions 的 name 属性

### 混合

`$mixins(...arg[:options])`

-   同 vueOptions 的 mixins

### 组件

`$components({...})`

-   同 vueOptions 的 components

### 自定义指令

`$directives({...})`

-   同 vueOptions 的 directives

### 组件传参

`$props({...})`

-   同 vueOptions 的 props

```js
$props({
    value: {
        type: String,
        default: ""
    }
})

// 以下是传统写法
{
    props: {
        value: {
            type: String,
            default: ""
        }
    }
}
```

### 数据设置

`$data({...})`

-   同 vueOptions 的 data
-   多次设置，会自动合并代码

### 原生函数式 setup 中数据输出

`$setup({...})` Vue3.0

-   同 vueOptions 的 setup

### 计算属性设置

`$computed({...})`

-   同 vueOptions 的 computed

### 筛选格式化

`$filters({...})`

-   同 vueOptions 的 filters
-   返回同\$filters 入参对应的对象数据

### 双向绑定设定

`$model({...})`

-   同 vueOptions 的 model

### 监控

`$watch({...})`

-   同 vueOptions 的 watch, 无返回

### 方法注册

`$methods({...})`

-   同 vueOptions 的 methods
-   方法名称首字母为 : 表示该方法第一个参数接收为 extData，同时，vue 中的方法名称中无:号

### 生命周期函数注册

`$lifecycle({...})`

> 多次注册同一个钩子函数同时生效

-   $created(funciton(){}) 同 $lifecycle("created", function(){})
-   $mounted(funciton(){}) 同 $lifecycle("mounted", function(){})
-   $destroyed(funciton(){}) 同 $lifecycle("destroyed", function(){})
-   其他请使用注册函数

### 事件触发

`$emit(...)`

-   默认将在 mounted 触发 this.\$emit

### \$nextTick

`$nextTick(fun:function)`

-   默认将在 mounted 触发 this.\$nextTick

### 绑定方法的第一个参数为特定功能参数 \$extData

`$(fun:function|object|array)`

### \$getExt

`$getExt(vm)`

-   获取 vm 对应的\$extData 数据

### \$setExt

`$setExt`

-   设置 \$extData 中的数据

## 特定的属性参数 \$extData

### 获取 vm 中的数据

`get(key:string):any`

-   获取 vm 中的数据，返回可以对应的值

### 设置 vm 的数据值

`set(key:string|object, value)`

-   设置 vm 中的数据

### 临时数据 temp

`temp`

### 临时数据 自动清理

`temp.$T$...`

-   此命名打头的，当 vm 销毁是，会自动调用 clearTimeout，并设置值为 -1

`temp.$I$...`

-   此命名打头的，当 vm 销毁是，会自动调用 clearInterval，并设置值为 -1

### 其他插件模式提供的方法

-   通过 vueExecFun.on 注册的其他方法

## 注册插件

```js
import Vue from "Vue"
import vueExecFun from "vue-exec-fun"
Vue.use(vueExecFun.install, function({...}){

})
```

### 在实例函数执行完成后运行

`after(fun:function)`

```js
after(function() {
    // 这里执行时，已经完成 vueExecFun 方法的执行了
})
```

### vueExecFun 方法参数

`fnArg`

-   通过次参数属性增加，可以增加 vueExecFun 中回调函数的参数
-   注意：after 之后设置，会导致在参数无法获取到

### 生命周期函数绑定

`lifecycle({...})`

-   同 \$lifecycle

### 自定义插件中的生命周期函数绑定

`makeLifecycle`

```js
// 新增life周期属性
let life = makeLifecycle()
// fnArg 新增属性 $life $before $ready
Object.assign(fnArg, {
    $life: life.on,
    $before: life.currying("before"),
    $ready: life.currying("ready")
})

after(function() {
    if (life.has()) {
        // 如果有钩子函数，就绑定到options
        life.make("life")
    }

    // console.log("options", options)
})
```

### 制作新的方法

`quickSet({...})`

```js
// 不会讲述，来两个实例吧

fnArg.$props = quickSet("props")

fnArg.$components = quickSet("components")

fnArg.$methods = quickSet("methods")
```

### 将某些方法绑定到制定生命周期后执行(默认 mounted )

`quickNext`

```js
$nextTick = quickNext("$nextTick")
$emit = quickNext("$emit")
```

### 设置 quickNext 绑定的生命周期函数

`setQuickNextExec(key:string)`

### 设置 options 的一些合并策略

`merges`

### 当前组件的 extData

`extData`
