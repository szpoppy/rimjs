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
- 发送消息 vm.$unicom('监听者', 参数1, 参数2...)
- 发送消息给分组 vm.$unicom('监听者@分组名', 参数1, 参数2...)
- 发送消息给id vm.$unicom('监听者@id', 参数1, 参数2...)
- 获取分组 vm.$unicom(@分组名)
- 获取id vm.$unicom(#id)

## demo
- demo在src中有实例

## cli引入
- 通过vue-cli引入，可以制定名称、发型消息函数名称、分组引用
- import vueSlip from 'vue-slip'
- Vue.use(vueSlip, {name:'名称', groupName:'分组使用名称', idName:'unicom注册参数名称'})
- groupName、idName 不设置，自定为 name + 'Name' 、 name + 'Id' 


## V1.1.0
- 将 unicomSend、unicomVM、unicomId 整合为一个函数 unicom