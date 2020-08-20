"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 星期几 中文
var weekDayArr = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
var weekDayArrE = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"];
var weekDayArrF = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
// 克隆一个时间兑现，是否只保留年月日
function wipeOut(date, isWipe) {
    if (isWipe === void 0) { isWipe = false; }
    if (isWipe) {
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        var d = date.getDate();
        return new Date(y + "/" + m + "/" + d);
    }
    return new Date(date.getTime());
}
/**
 * 新建一个时间对象
 * @param date 时间传入，支持 GMT
 * @param isWipe 是否去除时分秒
 * @return 返回新的时间对象（local）
 */
function parseDate(date, isWipe) {
    if (typeof date == "boolean") {
        isWipe = date;
        date = undefined;
    }
    if (!date) {
        // 返回当前时间
        return wipeOut(new Date(), isWipe);
    }
    // 日期
    if (date instanceof Date) {
        return wipeOut(date, isWipe);
    }
    // 时间戳
    if (typeof date == "number") {
        return wipeOut(new Date(date), isWipe);
    }
    var gmt = "";
    date = date.trim().replace(/\s*GMT(?:[+-]\d{1,4})?$/i, function (match) {
        gmt = " " + match.trim().toUpperCase();
        return "";
    });
    if (/^\d{13,}$/.test(date)) {
        date = parseInt(date);
        if (gmt) {
            return parseDate(getDate(date, "YYYY/MM/DD hh:mm:ss") + gmt, isWipe);
        }
        return wipeOut(new Date(date), isWipe);
    }
    date = date
        .replace(/^(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?$/, function (str, Y, M, D, h, m, s) {
        return Y + "/" + M + "/" + D + " " + (h || "00") + ":" + (m || "00") + ":" + (s || "00");
    })
        .replace(/-/g, "/")
        .replace(/T/, " ")
        .replace(/(?:\.[\d]+)?(\+[\d]+)?$/, function (s0, s1) {
        if (s1) {
            return " GMT" + s1;
        }
        return "";
    });
    // 防止报错
    return wipeOut(new Date(date + gmt), isWipe);
}
exports.parseDate = parseDate;
// 格式化
function format(str, arr, info) {
    if (!str) {
        // 无格式化字符串
        return info;
    }
    str = str.replace(/<(\w+):(.*?)>/g, function (s0, s1, s2) {
        var val = info[s1];
        if (val) {
            return val + s2;
        }
        return "";
    });
    for (var i = 0; i < arr.length; i += 1) {
        str = str.replace(new RegExp(arr[i], "g"), info[arr[i]]);
    }
    return str;
}
// 格式化日期
// formatStr为格式化日期
var parseArr = "YYYY,YY,MM,M,DD,D,hh,h,mm,m,ss,s,w,EW,FW,W,X".split(",");
function getDate(date, formatStr) {
    if (formatStr === void 0) { formatStr = ""; }
    var theDate = parseDate(date);
    var tZone = 0;
    if (tZone) {
        // 设置为要求时区的时间
        theDate.setMinutes(theDate.getTimezoneOffset() + tZone + theDate.getMinutes());
    }
    var YYYY = theDate.getFullYear();
    var YY = YYYY - 1900;
    var M = theDate.getMonth() + 1;
    var MM = ("0" + M).slice(-2);
    var D = theDate.getDate();
    var DD = ("0" + D).slice(-2);
    var h = theDate.getHours();
    var hh = ("0" + h).slice(-2);
    var m = theDate.getMinutes();
    var mm = ("0" + m).slice(-2);
    var s = theDate.getSeconds();
    var ss = ("0" + s).slice(-2);
    var w = theDate.getDay();
    var EW = weekDayArrE[w];
    var FW = weekDayArrF[w];
    var W = weekDayArr[w];
    var diff = wipeOut(theDate, true).getTime() - parseDate(true).getTime();
    var X = diff == 86400000 ? "明天" : diff == 0 ? "今天" : W;
    var opt = {
        date: theDate,
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
    };
    if (!formatStr) {
        return opt;
    }
    formatStr = formatStr.replace(/^([+-]\d+)([hm]):/i, function (match, n, uni) {
        tZone = parseInt(n);
        if (uni == "h") {
            tZone *= 60;
        }
        return "";
    });
    return format(formatStr, parseArr, opt);
}
exports.getDate = getDate;
// 时间间隔差
var diffIntervalArr = "D,ms,h,m,s".split(",");
function diffDate(arg1, arg2, arg3) {
    var num;
    var outStr;
    if (typeof arg1 == "number") {
        num = arg1;
        outStr = arg2 || "";
    }
    else {
        num = parseDate(arg1).getTime() - parseDate(arg2).getTime();
        outStr = arg3 || "";
    }
    var mm = Math.abs(num);
    // 毫秒
    var ms = mm % 1000;
    // 秒
    mm = Math.floor(mm / 1000);
    var s = mm % 60;
    mm = Math.floor(mm / 60);
    var m = mm % 60;
    mm = Math.floor(mm / 60);
    var h = mm % 24;
    var D = Math.floor(mm / 24);
    var opt = {
        D: D,
        ms: ms,
        h: h,
        m: m,
        s: s
    };
    if (!outStr) {
        return opt;
    }
    return format(outStr, diffIntervalArr, opt);
}
exports.diffDate = diffDate;
// 日期上增加特定时间
var appendTimeOpt = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
};
function appendDate(n, date, formatStr) {
    var num = n;
    if (typeof n == "string") {
        if (/^(-?\d+)([a-z])$/i.test(n)) {
            num = parseInt(RegExp.$1) * (appendTimeOpt[RegExp.$2.toLowerCase()] || 0);
        }
        else {
            num = 0;
        }
    }
    if (typeof formatStr == "boolean") {
        return new Date(parseDate(date, formatStr).getTime() + num);
    }
    var val = new Date(parseDate(date).getTime() + num);
    if (formatStr) {
        return getDate(val, formatStr);
    }
    return val;
}
exports.appendDate = appendDate;
exports.default = {
    parse: parseDate,
    get: getDate,
    diff: diffDate,
    append: appendDate
};
//# sourceMappingURL=index.js.map