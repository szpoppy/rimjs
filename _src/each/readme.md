# each 循环

> `stopFn` 为中止循环

```js
// 数组循环遍历
each(["1"], function(item, index, stopFn){
    ...
})
// 返回 ["x", "1:"]
each(["1"], function(item, index, stopFn){
    return item + ":"
}, ["x"])

// 对象循环
each({x:1, y: 2}, function(item, key, stopFn){
    ...
})

// 返回 ["x", "1:x"]
each({x:1, y: 2}, function(item, key, stopFn){
    stopFn()
    return item + ":" + key
}, ["x"])

// 返回 {z:1, x: 1}
each({x:1, y: 2}, function(item, key, stopFn){
    stopFn()
    return item
}, {z:1})
```