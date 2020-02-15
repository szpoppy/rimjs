// 星期几 中文
const weekDayArr: Array<string> = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
const weekDayArrE: Array<string> = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"]
const weekDayArrF: Array<string> = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
const oneDayNum: number = 24 * 60 * 60 * 1000

// 克隆一个时间兑现，是否只保留年月日
function wipeOut(date: Date, isWipe: boolean = false): Date {
    let t: number = date.getTime()
    if (isWipe) {
        t = Math.floor(t / oneDayNum) * oneDayNum
    }
    return new Date(t)
}

export type dateType = boolean | number | string | Date

/**
 * 新建一个时间对象
 * @param date 时间传入，支持 GMT
 * @param isWipe 是否去除时分秒
 * @return 返回新的时间对象（local）
 */
export function parseDate(date?: dateType, isWipe?: boolean): Date {
    if (typeof date == "boolean") {
        isWipe = date
        date = undefined
    }

    if (!date) {
        // 返回当前时间
        return new Date()
    }

    // 日期
    if (date instanceof Date) {
        return wipeOut(date, isWipe)
    }

    // 时间戳
    if (typeof date == "number") {
        return wipeOut(new Date(date), isWipe)
    }

    let gmt: string = ""
    date = (date as string).trim().replace(/\s*GMT(?:[+-]\d{1,4})?$/i, function(match: string) {
        gmt = " " + match.trim().toUpperCase()
        return ""
    })

    if (/^\d{13,}$/.test(date)) {
        date = parseInt(date)
        if (gmt) {
            return parseDate((getDate(date, "YYYY/MM/DD hh:mm:ss") as string) + gmt, isWipe)
        }
        return wipeOut(new Date(date), isWipe)
    }

    date = date
        .replace(/^(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?$/, function(str, Y, M, D, h, m, s) {
            return Y + "/" + M + "/" + D + " " + (h || "00") + ":" + (m || "00") + ":" + (s || "00")
        })
        .replace(/-/g, "/")
        .replace(/T/, " ")
        .replace(/\.\d+$/, "")

    // 防止报错
    return wipeOut(new Date(date + gmt), isWipe)
}

// 格式化
function format(str?: string, arr: Array<string> = [], info: any = {}): any {
    if (!str) {
        // 无格式化字符串
        return info
    }
    str = str.replace(/<(\w+):(.*?)>/g, function(s0, s1, s2) {
        var val = info[s1]
        if (val) {
            return val + s2
        }
        return ""
    })
    for (var i = 0; i < arr.length; i += 1) {
        str = str.replace(new RegExp(arr[i], "g"), info[arr[i]])
    }
    return str
}

// 格式化日期
// formatStr为格式化日期
let parseArr: Array<string> = "YYYY,YY,MM,M,DD,D,hh,h,mm,m,ss,s,w,EW,FW,W,X".split(",")
/**
 * 将date格式化为formatStr的格式
 * @param date
 * @param formatStr
 */
export function getDate(date?: dateType, formatStr: string = "") {
    let theDate: Date = parseDate(date)
    let tZone: number = 0
    formatStr = formatStr.replace(/^([+-]\d+)([hm]):/i, function(match, n, uni) {
        tZone = parseInt(n)
        if (uni == "h") {
            tZone *= 60
        }
        return ""
    })
    if (tZone) {
        // 设置为要求时区的时间
        theDate.setMinutes(theDate.getTimezoneOffset() + tZone + theDate.getMinutes())
    }
    let YYYY = theDate.getFullYear()
    let YY = YYYY - 1900
    let M = theDate.getMonth() + 1
    let MM = ("0" + M).slice(-2)
    let D = theDate.getDate()
    let DD = ("0" + D).slice(-2)
    let h = theDate.getHours()
    let hh = ("0" + h).slice(-2)
    let m = theDate.getMinutes()
    let mm = ("0" + m).slice(-2)
    let s = theDate.getSeconds()
    let ss = ("0" + s).slice(-2)
    let w = theDate.getDay()
    let EW = weekDayArrE[w]
    let FW = weekDayArrF[w]
    let W = weekDayArr[w]

    let diff = wipeOut(theDate, true).getTime() - parseDate(true).getTime()
    let X = diff == 86400000 ? "明天" : diff == 0 ? "今天" : W

    return format(formatStr, parseArr, {
        date: date,
        YYYY: YYYY,
        YY: YY,
        MM: MM,
        M: M,
        DD: DD,
        D: D,
        hh: hh,
        h: h,
        mm: mm,
        m: m,
        ss: ss,
        s: s,
        w: w,
        W: W,
        EW: EW,
        FW: FW,
        X: X
    })
}

interface diffOut {
    D: number
    ms: number
    h: number
    s: number
}

// 时间间隔差
const diffIntervalArr = "D,ms,h,m,s".split(",")
/**
 * date1 和 date2之间的时间差
 * @param arg1
 * @param arg2
 * @param arg3 格式化
 */
export function diffDate(arg1: dateType | number, arg2: dateType | string, arg3?: string): string | diffOut {
    let num: number
    let outStr: string
    if (typeof arg1 == "number") {
        num = arg1
        outStr = arg2 as string
    } else {
        num = parseDate(arg1).getTime() - parseDate(arg2).getTime()
        outStr = arg3 as string
    }

    let mm: number = Math.abs(num)
    // 毫秒
    let ms: number = mm % 1000
    // 秒
    mm = Math.floor(mm / 1000)
    let s = mm % 60
    mm = Math.floor(mm / 60)
    let m = mm % 60
    mm = Math.floor(mm / 60)
    let h = mm % 24
    let D = Math.floor(mm / 24)

    return format(outStr, diffIntervalArr, {
        D: D,
        ms: ms,
        h: h,
        m: m,
        s: s
    })
}

// 日期上增加特定时间
const appendTimeOpt: any = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
}
/**
 * 在date上增加时间
 * @param n
 * @param date
 * @param formatStr
 */
export function appendDate(n: string | number, date: dateType, formatStr?: string) {
    let num: number = n as number
    if (typeof n == "string") {
        if (/^(-?\d+)([a-z])$/i.test(n)) {
            num = parseInt(RegExp.$1) * (appendTimeOpt[RegExp.$2.toLowerCase()] || 0)
        } else {
            num = 0
        }
    }

    let val = new Date(parseDate(date).getTime() + num)
    if (formatStr) {
        return getDate(val, formatStr)
    }
    return val
}

export default {
    parse: parseDate,
    get: getDate,
    diff: diffDate,
    append: appendDate
}
