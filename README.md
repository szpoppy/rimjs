# vue-unicom
- vue提供组件通讯机制

## 运行demo
- npm install
- npm install gulp -g   (安装过可以忽略)
- gulp
- 浏览器中输入http://127.0.0.1:3101 (PC)
- 浏览器中输入http://ip:3101 (手机浏览器)

## API
- options 参数 unicom < Object > , 设置监听者
- options 参数 unicomName < String|Array > , 设置分组
- 实例参数 <组件 unicom-id="x" />  设置组件唯一ID
- 发送消息 vm.$unicomSend('监听者', 参数1, 参数2...)
- 获取分组引用 vm.$unicomVM[分组名称] < Array >
- 获取unicom-id组件 vm.$unicomId[unicom-id] < vm >

## demo
- demo在src中有实例

## cli引入
- 通过vue-cli引入，可以制定名称、发型消息函数名称、分组引用
- import vueSlip from 'vue-slip'
- Vue.use(vueSlip, {name:'名称',sendName:'发送函数名称',groupName:'分组使用名称'})
- sendName、groupName 不设置，自定为 name + 'Send', name + 'VM'