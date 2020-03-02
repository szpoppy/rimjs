type TExpiration = number | string | Date
function getExpiration(expiration: TExpiration): Date {
    if (typeof expiration === "number") {
        if (expiration == -1) {
            // 永久
            return new Date("3000/01/01")
        }
        // 数字，为 天数
        return new Date(new Date().getTime() + expiration * 24 * 60 * 60 * 1000)
    }
    if (typeof expiration === "string") {
        let match = expiration.match(/^\s*(\d)+\s*([dhm])\s*$/)
        if (match) {
            let date = new Date()
            switch (match[2]) {
                case "d":
                    date.setDate(date.getDate() + parseInt(match[1]))
                    break
                case "m":
                    date.setMinutes(date.getMinutes() + parseInt(match[1]))
                    break
                case "h":
                    date.setHours(date.getHours() + parseInt(match[1]))
                    break
            }
            return date
        }
        return new Date(
            expiration
                .replace(/-/g, "/")
                .replace(/T/, " ")
                .replace(/\.\d*$/, "")
        )
    }
    return expiration
}

/**
 * 获取cookie
 * @param {String} key
 */
export function getCookie(key: string): string {
    return new RegExp("; ?" + key + "=([^;]*);?").test("; " + document.cookie) ? decodeURIComponent(RegExp.$1) : ""
}

/**
 * 设置cookie
 * @param {String} key
 * @param {String} value
 * @param {Number|String|Date} expiration 0:进程，-1:永久，数字:天数，字符串，日期
 * @param {Number|String|Date} expiration 1d 1天 1h 1小时 1m 1分钟
 * @param {String} path 文档路径
 * @param {String} domain 域名，可以设置主域名
 */
export function setCookie(key: string, value: string, expiration: TExpiration = 0, path?: string, domain?: string): void {
    let str = key + "=" + encodeURIComponent(value)
    if (expiration) {
        str += "; expires=" + getExpiration(expiration).toString()
    }
    if (path) {
        str += "; path=" + path
    }
    if (domain) {
        str += "; domain=" + domain
    }

    document.cookie = str
}

/**
 * 移除cookie
 * @param {*} key
 * @param {*} path 文档路径
 * @param {*} domain 域名，可以设置主域名
 */
export function removeCookie(key: string, path?: string, domain?: string): void {
    let str = key + "=; expires=" + new Date(0).toString()
    if (path) {
        str += "; path=" + path
    }
    if (domain) {
        str += "; domain=" + domain
    }
    document.cookie = str
}

// 预先设置好 过期时间 路径 域名
export default class Cookie {
    expiration?: Date
    path?: string
    domain?: string

    constructor({ expiration, path, domain }: { expiration: TExpiration; path?: string; domain?: string } = { expiration: 0 }) {
        this.expiration = getExpiration(expiration)
        if (path) {
            this.path = path
        }
        if (domain) {
            this.domain = domain
        }
    }

    // 获取
    static getItem = getCookie
    getItem(key: string): string {
        return getCookie(key)
    }

    // 设置
    static setItem = setCookie
    setItem(key: string, value: string): void {
        return setCookie(key, value, this.expiration, this.path, this.domain)
    }

    // 移除
    static removeItem = removeCookie
    removeItem(key: string): void {
        removeCookie(key, this.path, this.domain)
    }
}
