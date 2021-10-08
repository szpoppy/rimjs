# event

统一的事件处理

## 使用

> import Event from "rimjs/event"

### 使用

```ts
let event = new Event()

// 添加事件
event.on("event_one", funciton(data){})
event.emit("event_one", {})
```
### 继承
```ts
class Ajax extends Event {
    constructor() {
        super()
    }

    // 设置多个事件复写，主要时为了可以智能提示传入的参数
    // 发送前调用，这样ts可以智能提示 arg的参数类型为 AjaxReq
    on(type: "beforeSend", fn: (arg: AjaxReq) => void, isPre: boolean = false): void 
    // 回调，这样ts可以智能提示 arg的参数类型为 AjaxRes
    on(type: "callback", fn: (arg: AjaxRes) => void, isPre: boolean = false): void 
    on(type: "beforeSend" | "callback", fn: (arg: AjaxRes | AjaxReq) => void, isPre: boolean = false): void {
        // 调用内部的实现函数
        this[":on"](type, fn, isPre)
    }

    ...
}
```