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

interface sStorage {
    getItem(key: string): string
    setItem(key: string, val: string): void
    removeItem(key: string): void
}

// 本地存储引用
let LS: sStorage = window.localStorage
let SS: sStorage = window.sessionStorage

// 本地存储是否可以使用
let canLS: boolean = true
try {
    LS.setItem("ls_can", "1")
    if (LS.getItem("ls_can") != "1") {
        canLS = false
    }
} catch (e) {
    canLS = false
}

if (!canLS) {
    // 无本地存储，模拟本地实现
    // 数据存储本地，无法长期存储
    // 缓解无痕模式无法存储的问题
    let LSStore = {}
    LS = {
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

    let SSStore = {}
    SS = {
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
}

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

/**
 * 本地存储分组类
 */
export class LSClass {
    preposition: string = ":"
    LSClass?: Function
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
        let json: storeData
        try {
            json = JSON.parse(val)
        } catch (e) {}
        if (!json) {
            // 非
            return null
        }

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
                json.expiration = new Date().getTime() + expiration * 24 * 60 * 60 * 1000
            }
        } else {
            if (typeof expiration == "string") {
                expiration = new Date(
                    expiration
                        .replace(/\-/g, "/")
                        .replace(/T/, " ")
                        .replace(/\.\d*$/, "")
                )
            }
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
let ls = new LSClass(":")
ls.LSClass = LSClass
export default ls
