import dateFn from "../date"
import EventEmitter from "../event"

/**
 * 获取当前时间，可以更改为获取当前服务器时间
 */
let getNow = function() {
    return dateFn.parse()
}

class TimeEventData {
    diff: string = ""
    spt: number = 0
}

type timeType = string | number | boolean | Date

class TimeEvent extends EventEmitter {
    // 结束时间
    endNum: number = 0
    prevNum: number = 0

    diffText: string = "<hh:时><mm:分>ss秒"

    isStop: boolean = false
    toStop: boolean = false

    constructor(time?: timeType, diffText?: string) {
        super()
        if (time) {
            this.setEndNum(time)
        }

        if (diffText) {
            this.diffText = diffText
        }
    }

    on(type: "change" | "end", fn: (arg: TimeEventData) => void, isPre: boolean = false): TimeEvent {
        this[":on"]<TimeEvent>(type, fn, isPre)
        return this
    }

    setEndNum(time: string | number | boolean | Date) {
        if (typeof time == "number") {
            time = dateFn.parse().getTime() + time * 1000
        }
        this.endNum = dateFn.parse(time).getTime()
    }

    emitDiff() {
        if (this.isStop) {
            return false
        }
        return one(this)
    }

    stop() {
        if (!this.isStop) {
            this.toStop = true
        }
    }

    getNow() {
        return getNow()
    }
}

let queue: TimeEvent[] = []
let interval: null | ReturnType<typeof setInterval> = null

/**
 * 执行一次 一个 循环
 * @param {*} x
 */
function one(x: TimeEvent) {
    let ev = new TimeEventData()
    if (!x.isStop && x.toStop) {
        x.toStop = false
        x.emit("change", ev)
        return false
    }
    let spt = Math.floor((x.endNum - x.getNow().getTime()) / 1000)
    ev.spt = spt
    if (x.prevNum != spt) {
        // 本次时差与上一次有差异，就执行回调
        // 当spt <= 0 为最后一次回调
        let diff = dateFn.diff(spt * 1000, x.diffText) as any
        ev.diff = diff
        x.prevNum = spt
        if (spt <= 0) {
            x.isStop = true
            x.emit("end", ev)
        } else {
            x.emit("change", ev)
        }
    }
    return spt > 0
}

function step() {
    if (queue.length) {
        for (let i = 0; i < queue.length; ) {
            if (one(queue[i])) {
                // 下一个
                i += 1
            } else {
                // 移除
                queue.splice(i, 1)
            }
        }
    } else {
        // 无队列，移除 interval
        clearInterval(interval)
        interval = null
    }
}

/**
 * 倒计时 函数
 * @param {Number|String|Date} time 为数字时，代表，需要执行多少秒的倒计时
 * @return {eventemitter} 自定义事件对象
 * @event change 事件，剩余时间 改变时触发，两个参数 第一个 diff 字符串 第二个diff（秒）
 * @event end 倒计时结束时候调用
 */
function timeDown(time: string | number | boolean | Date, diffText?: string) {
    let one = new TimeEvent(time, diffText)
    queue.push(one)
    if (!interval) {
        interval = setInterval(step, 250)
    }
    return one
}

/**
 * 设置默认的 获取当前时间的函数
 * @param {Function} fn
 */
function setGetNowFn(fn: () => Date) {
    getNow = fn
    return timeDown
}

/**
 * 终止
 */
function stopAll() {
    queue.forEach(item => {
        item.stop()
    })
    queue = []
    // 无队列，移除 interval
    clearInterval(interval)
    interval = null
}
export default Object.assign(timeDown, {
    stopAll,
    setGetNowFn
})
