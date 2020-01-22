interface initOpt {
    // a=b&c=1 中的 &
    sep?: string
    // a=b&c=1 中的 =
    eq?: string
    // 对数据格式化
    unescape?: Function
    // 数据序列化
    escape?: Function
}

class QueryString {
    QS: Function
    sep: string = "&"
    eq: string = "="
    unescape: Function = window.decodeURIComponent
    escape: Function = window.encodeURIComponent
    constructor(opt?: initOpt) {
        if (opt) {
            Object.assign(this, opt)
        }
    }

    /**
     * 解析为 对象输出
     * @param str
     */
    parse(str: string): object {
        let sep = this.sep
        let eq = this.eq
        let unescape = this.unescape

        let data: object = {}
        // 去除部分没有的字符
        str.replace(/^[\s#?]+/, "")
            .split(sep)
            .forEach(function(item) {
                if (!item) {
                    return
                }
                let arr = item.split(eq)
                let key = arr[0]
                if (key) {
                    let val = unescape(arr[1] || "")
                    if (data[key] === undefined) {
                        // 赋值
                        data[key] = val
                    } else if (data[key].push) {
                        // 多个相同字符
                        data[key].push(val)
                    } else {
                        // 值转化为数组
                        data[key] = [data[key], val]
                    }
                }
            })
        return data
    }

    /**
     * 序列化为字符串
     * @param opt
     */
    stringify(opt: object): string {
        let sep = this.sep
        let eq = this.eq
        let escape = this.escape

        let arr: Array<string> = []
        for (let n in opt) {
            let item: any = opt[n]
            if (item == null) {
                item = ""
            }
            let key: string = escape(n)
            if (item && item.constructor == Array) {
                // 数组要转化为多个相同kv
                item.forEach(function(one) {
                    arr.push(key + eq + escape(one))
                })
            } else {
                arr.push(key + eq + escape(item))
            }
        }
        return arr.join(sep)
    }
}

let qs = new QueryString()
qs.QS = QueryString

export default qs