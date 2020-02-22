type setDataFn = (data: any) => void
type getDataFn = (setData: setDataFn, key: string) => void

type backFn<T> = (value: T) => void

class Cache<T> {
    backs: backFn<T>[] = []
    inited: 0 | 1 | 2 = 0
    data!: T

    setData(data: T) {
        this.data = data
        this.inited = 2

        while (this.backs.length) {
            let fn = this.backs.shift() as backFn<T>
            fn(this.data)
        }
    }
}

export function promiseCache<T = any>(getFn: getDataFn) {
    let caches: Record<string, Cache<T>> = {}
    return function(key: string = ":default") {
        let cache = caches[key]
        if (!cache) {
            cache = caches[key] = new Cache()
        }

        // 直接返回已经存在
        return new Promise<T>(function(resolve) {
            if (cache.inited > 1) {
                resolve(cache.data)
                return
            }
            cache.backs.push(resolve)

            if (cache.inited < 1) {
                cache.inited = 1
                getFn(function(data) {
                    cache.setData(data)
                }, key)
            }
        })
    }
}

export default {
    promise: promiseCache
}