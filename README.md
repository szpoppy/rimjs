<p align="center">
   <a href="https://www.npmjs.com/package/rimjs">
   		<img src="https://img.shields.io/npm/v/rimjs.svg?style=flat" alt="npm">
   </a>
   <a href="https://www.npmjs.com/package/rimjs">
   		<img src="https://img.shields.io/npm/dm/rimjs.svg?style=flat" alt="npm">
   </a>
</p>
# 使用TS写的一些浏览器js的周边

## npm

[https://www.npmjs.com/package/rimjs](https://www.npmjs.com/package/rimjs)

## 更新日志
[2021-2-7] ajax支持nodejs（FormData没测试），使用方式不变
[2021-04-30] vueLake、vueUnicom 支持通过参数 useProps:false 设置禁用全局的 name 和 id功能
[2021-12-31] ajax中 orgin 改为 origin，ajax已经重构为原生支持nodejs，也能支持FormData 使用内部定义的 NodeFormData来传递参数

## 功能
| 名称                                    | 说明                                        |
| --------------------------------------- | ------------------------------------------- |
| [Ajax](https://github.com/szpoppy/rimjs/blob/master/_src/ajax/readme.md)           | 封装了一套ajax处理，支持jsonp和短路径       |
| [assign](https://github.com/szpoppy/rimjs/blob/master/_src/assign/readme.md)       | 深度拷贝&lt;assing&gt;以及合并&lt;merge&gt; |
| [cache](https://github.com/szpoppy/rimjs/blob/master/_src/cache/readme.md)         | 缓存机制，第一次加载请求，然后缓存          |
| [cookie](https://github.com/szpoppy/rimjs/blob/master/_src/cookie/readme.md)       | cookie封装                                  |
| [date](https://github.com/szpoppy/rimjs/blob/master/_src/date/readme.md)           | date处理函数封装                            |
| [debug](https://github.com/szpoppy/rimjs/blob/master/_src/debug/readme.md)         | 调试功能封装                                |
| [each](https://github.com/szpoppy/rimjs/blob/master/_src/each/readme.md)           | 类似原生的forEach，对象的循环               |
| [event](https://github.com/szpoppy/rimjs/blob/master/_src/event/readme.md)         | 通用事件封装，ajax就是基于这个实现          |
| [md5](https://github.com/szpoppy/rimjs/blob/master/_src/md5/readme.md)             | md5封装，来自网络第三方                     |
| [qs](https://github.com/szpoppy/rimjs/blob/master/_src/qs/readme.md)               | querystring的实现                           |
| [slip](https://github.com/szpoppy/rimjs/blob/master/_src/slip/readme.md)           | 点击后移动的封装                            |
| [sole](https://github.com/szpoppy/rimjs/blob/master/_src/sole/readme.md)           | 返回页面唯一的id字符串                      |
| [storage](https://github.com/szpoppy/rimjs/blob/master/_src/storage/readme.md)     | 对原生的本地存储强化封装                    |
| [validata](https://github.com/szpoppy/rimjs/blob/master/_src/validate/readme.md)   | 一些验证函数集合                            |
| [vueFn](https://github.com/szpoppy/rimjs/blob/master/_src/vueFn/readme.md)         | vue的一套函数式编程                         |
| [vueLife](https://github.com/szpoppy/rimjs/blob/master/_src/vueLife/readme.md)     | vue自定义生命周期                           |
| [vueUnicom](https://github.com/szpoppy/rimjs/blob/master/_src/vueUnicom/readme.md) | vue的组件通讯                               |
| [vueLake](https://github.com/szpoppy/rimjs/blob/master/_src/vueLake/readme.md)     | vue的组件通讯,vueUnicom升级，支持异步模式   |
