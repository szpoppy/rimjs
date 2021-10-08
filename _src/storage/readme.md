# H5 本地存储增强

-   支持对本地存储设置过期时间
-   当浏览器无法使用本地存储是（无痕模式），会自动降级，将数据存入内存中

## 使用

```javascript
import store from "rimjs/storage"

// 获取设置的本地数据
store.getItem("the-key")

// 设置本地存储 默认进程
store.getItem("the-key", "value")

// 设置本地存储 无过期
store.getItem("the-key", "value", -1)

// 设置本地存储 一天后过期
store.getItem("the-key", "value", 1)

// 设置本地存储 2200-10-1日过期
store.getItem("the-key", "value", "2200-10-1")

// 移除
store.removeItem("the-key")

// 更改默认的前置字符串 默认为 :
store.prepreposition = "$"

// 创建新的存储分组，并且使用 v4#作为前缀
// store4 包含上面那些方法
let store4 = new store.LSStore("v4#")
```

## API

### 前缀

> store.prepreposition

-   为了和原生的本地存储区分，特地在所有通过此设置的数据，都加上前缀
-   此前缀可以修改

### 存储

> store.setItem(key:string, value: any [,expiration:string;data;number = 0])

-   key 本地存储的唯一 key
-   value 存入的基础数据
-   expiration 什么时候过期 默认为 0
    -   -1 永久不过期 相当于 localStorage
    -   0 相当于 sessionStorage
    -   大于 0 多少毫秒后过期
    -   时间字符串 过期时间
    -   1d 1天后过期
    -   1h 1小时后过期
    -   1m 1分钟后过期
    -   1s 1秒后过期
    -   日期 过期时间

### 获取

> store.getItem(key:string)

-   key 本地存储的唯一 key

### 移除

> store.removeItem(key:string)

-   key 本地存储的唯一 key

### 创建新的本地存储分组

> new store.LSStore(prev:string)

-   prev 为本分组存入的本地存储的前缀
