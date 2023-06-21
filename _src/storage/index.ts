interface storeData {
    expiration?: number
    session?: string
    item?: any
}

let soleTime: number = new Date().getTime() - 1000000
let soleCount: number = 1000

// 获取页面唯一的值
function getOne(): string {
    soleCount
    soleCount += 1
    let rnd: string = (Math.round((Math.random() + 1) * 1000000) + (new Date().getTime() - soleTime)).toString()
    return parseInt(rnd + "" + soleCount.toString()).toString(36)
}

// 本地存储引用
// 无本地存储，模拟本地实现
// 数据存储本地，无法长期存储
// 缓解无痕模式无法存储的问题
let LSStore: any = {}
let LS: any = {
    getItem(key: string): string {
        return LSStore[key]
    },
    setItem(key: string, val: string): void {
        LSStore[key] = val
    },
    removeItem(key: string): void {
        try {
            delete LSStore[key]
        } catch (e) {}
    }
}

let SSStore: any = {}
let SS: any = {
    getItem(key: string): string {
        return SSStore[key]
    },
    setItem(key: string, val: string): void {
        SSStore[key] = val
    },
    removeItem(key: string): void {
        try {
            delete SSStore[key]
        } catch (e) {}
    }
}

// 本地存储是否可以使用
try {
    window.localStorage.setItem("ls_can", "1")
    if (window.localStorage.getItem("ls_can") == "1") {
        LS = window.localStorage
        SS = window.sessionStorage
    }
} catch (e) {}

let sKeyKey: string = ":store-s-key"
let sKey: string = SS.getItem(sKeyKey)
if (!sKey) {
    sKey = getOne()
    SS.setItem(sKeyKey, sKey)
}

// 移除
function remove(key: string): void {
    LS.removeItem(key)
}

// 日期上增加特定时间
const appendTimeOpt: any = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
}

/**
 * 本地存储分组类
 */
export class LSClass {
    preposition: string = ":"
    /**
     * pre 为前置参数
     * @param pre
     */
    constructor(pre: string) {
        if (pre) {
            this.preposition = pre
        }
    }

    /**
     * 获取本地存储
     * @param key key
     */
    getItem(key: string): any {
        key = this.preposition + key
        let val = LS.getItem(key)
        let json: storeData | null
        try {
            json = JSON.parse(val)
        } catch (e) {
            return
        }
        if (json) {
            // 检测是否过期
            let expiration = json.expiration
            let isOut: boolean = false
            if (expiration) {
                let now = new Date().getTime()
                if (expiration !== -1 && now > expiration) {
                    // 过期
                    isOut = true
                }
            }
            let session = json.session
            if (!isOut && session && session != sKey) {
                // 过期
                isOut = true
            }
            if (isOut) {
                remove(key)
                return null
            }
            return json.item
        }

        return null
    }

    /**
     * 设置本地存储
     * @param key
     * @param value 存入的值
     * @param expiration 过期时间
     */
    setItem(key: string, value: any, expiration: number | string | Date = 0): void {
        key = this.preposition + key
        let json: storeData = { item: value }

        if (typeof expiration == "number") {
            if (expiration === 0) {
                json.session = sKey
            } else if (expiration === -1) {
                json.expiration = -1
            } else {
                json.expiration = new Date().getTime() + expiration
            }
        } else if (typeof expiration == "string") {
            if (/^(\d+)([a-z])$/i.test(expiration)) {
                let num = parseInt(RegExp.$1) * (appendTimeOpt[RegExp.$2.toLowerCase()] || 0)
                json.expiration = new Date().getTime() + num
            } else {
                json.expiration = new Date(
                    expiration
                        .replace(/-/g, "/")
                        .replace(/T/, " ")
                        .replace(/\.\d*$/, "")
                ).getTime()
            }
        } else if (expiration instanceof Date) {
            json.expiration = expiration.getTime()
        }

        LS.setItem(key, JSON.stringify(json))
    }

    /**
     * 移除数据
     * @param key
     */
    removeItem(key: string): void {
        remove(this.preposition + key)
    }
}

/**
 * 输出类
 */
let ls = Object.assign(new LSClass(":"), { LSClass })

export let getStorage = ls.getItem
export let setStorage = ls.setItem
export let removeStorage = ls.removeItem

export default ls
