# cache 异步缓存化

## 使用

`import { promiseCache } from "rimjs/cache"`

```ts
// 按照字母查询
let getCityByLetter = promiseCache<City[]>(function(set, key) {
    // 第一次请求会 调用此函数获取数据
    request.load(
        "webapi:getcitylistbyletter.html",
        function({ res }) {
            let locs = res.getData("TrainStation.StationList") || []
            let citys: City[] = []
            locs.forEach((loc: any) => {
                citys.push(new City({ id: loc.ID, name: loc.Name, city: loc.CityName }))
            })
            // 获取到数据后，设置数据
            set(citys)
        },
        { Letter: key, AllCity: 0 }
    )
})

// 直接调用，按照letter 分类缓存数据
// 缓存数据无有效期，并且只在内存中
let citys = await getCityByLetter(letter)
```