type initedNum = 0 | 2
type setDataFn = (data: any, initNum?: initedNum) => void
type getDataFn = (setData: setDataFn, para: any) => void

type backFn<T> = (value: T) => void

class Cache<T> {
    backs: backFn<T>[] = []
    inited: initedNum | 1 = 0
    date: number = new Date().getTime()
    data!: T

    setData(data: T, inited: initedNum | Boolean = true) {
        if (inited == 2 || inited === true) {
            // 为0，异常，不更新
            this.data = data
        }

        this.inited = inited ? 2 : 0

        while (this.backs.length) {
            let fn = this.backs.shift() as backFn<T>
            fn(data)
        }
    }
}

function getKeyDef(para: any): string {
    if (typeof para == "string") {
        return para
    }
    if (para && para.toString) {
        return para.toString()
    }
    return ":default"
}

export interface IPromiseCacheBackFn<T = any> {
    (para?: any) : Promise<T>
    caches: Record<string, Cache<T>>
}

export function promiseCache<T = any>(getFn: getDataFn, eTime: number = 0, getKey: (key: any) => string = getKeyDef): IPromiseCacheBackFn<T> {
    let caches: Record<string, Cache<T>> = {}
    let cacheFn = function(para = null) {
        let key = getKey(para)
        let cache = caches[key]
        if (cache && cache.inited == 2 && eTime > 0 && cache.date + eTime < new Date().getTime()) {
            // 已经过期了
            cache.inited = 0
        }
        if (!cache) {
            // 不存在或者过期了
            cache = caches[key] = new Cache()
        }

        // 直接返回已经存在
        return new Promise(function(resolve) {
            if (cache.inited > 1) {
                resolve(cache.data)
                return
            }
            cache.backs.push(resolve)

            if (cache.inited < 1) {
                cache.inited = 1
                getFn(function(data, inited) {
                    cache.setData(data, inited)
                }, para)
            }
        })
    } as IPromiseCacheBackFn<T>
    cacheFn.caches = caches
    return cacheFn
}

export default {
    promise: promiseCache
}
