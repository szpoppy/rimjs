## 滑块基础控件

```ts
import Slip from "rimjs/slip"

// 注册一个slip ，绑定 id为 id的dom
// 这个dom触按住后，移动，会触发 move事件
// 100 表示 初始状态下，x的移动范围智能在100以内
let slip = new Slip("id", 100)

// 按下时触发
slip.on("start", function(event) {})

// 按下时不放移动触发
slip.on("start", function({ x, y, event }) {})

// 松开时触发
slip.on("end", function({ x, y, event }) {})
```
