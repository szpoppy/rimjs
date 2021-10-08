```js
// 引入
import qs from "rimjs/qs"
import {parseQS, stringifyQS, QueryString} from "rimjs/qs"

// 将对象转换字符串 同 qs.stringify
stringifyQS({a: 1, b: [1,2]})  // a=1&b=1&b=2

// qs 字符串转换为对象 同 qs.parse
parseQS("a=1&b=1&b=2") // {a: 1, b: [1,2]}

// 生成新的对象 同 qs.QueryString
let qss = new QueryString({
    // a=1&b=1&b=2 中的 &连接符
    sep: "&",
    // a=1&b=1&b=2 中的 =连接符
    eq: "=",
    // 对字符串格式化 parse
    unescape: decodeURIComponent
    // 序列化字符串时的格式化字符串函数 stringify
    escape: encodeURIComponent
})
```
