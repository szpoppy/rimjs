import EventEmitter from "../event"

let doc = window.document

let isTouch = "ontouchstart" in doc

let moveData: Slip | null = null

function getEventXY(ev: any) {
    //移动是多点触控，默认使用第一个作为clientX和clientY
    if (ev.clientX == null) {
        let touches = ev.targetTouches && ev.targetTouches[0] ? ev.targetTouches : ev.changedTouches
        if (touches && touches[0]) {
            ev.clientX = touches[0].clientX
            ev.clientY = touches[0].clientY
            return [touches[0].clientX, touches[0].clientY]
        }
    }
    return [ev.clientX, ev.clientY]
}

let events = {
    move: isTouch ? "touchmove" : "mousemove",
    down: isTouch ? "touchstart" : "mousedown",
    up: isTouch ? "touchend" : "mouseup"
}
function appendEvent(dom: HTMLElement | Document, type: "move" | "down" | "up", fn: EventListener, cap: boolean = false) {
    dom.addEventListener(events[type], fn, !!cap)
}
function removeEvent(dom: HTMLElement | Document, type: "move" | "down" | "up", fn: EventListener, cap: boolean = false) {
    dom.removeEventListener(events[type], fn, !!cap)
}

function getMax(m: number, c: number) {
    if (m == 0) {
        return c
    }
    if (m < 0) {
        return c < m ? m : c > 0 ? 0 : c
    }
    return c > m ? m : c < 0 ? 0 : c
}

//鼠标移动开始
function slipDown(this: Slip, ev: Event) {
    if (moveData) {
        return
    }
    moveData = this
    appendEvent(doc, "move", slipMove, true)
    appendEvent(doc, "up", slipUp, true)
    let [x, y] = getEventXY(ev)
    this.bx = this.ax - x
    this.by = this.ay - y
    this.emit("start", ev)
}

function getSlipData(ev: Event) {
    let [x, y] = getEventXY(ev)
    let md = moveData as Slip
    return {
        x: getMax(md.mx, x + md.bx),
        y: getMax(md.my, y + md.by),
        event: ev
    }
}

//鼠标移动中
function slipMove(evt: Event) {
    if (moveData) {
        let x = window.getSelection && window.getSelection()
        if (x) {
            x.removeAllRanges()
        }
        moveData.emit("move", getSlipData(evt))
    }
}

//鼠标抬起
function slipUp(evt: Event) {
    if (moveData) {
        removeEvent(doc, "up", slipUp, true)
        removeEvent(doc, "move", slipMove, true)
        let d = getSlipData(evt)
        let { x, y } = d
        moveData.ax = x
        moveData.ay = y
        moveData.emit("end", d)
        moveData = null
    }
}

export default class Slip extends EventEmitter {
    dom: HTMLElement
    ax: number = 0
    ay: number = 0
    mx: number = 0
    my: number = 0
    bx: number = 0
    by: number = 0

    // 所有事件
    on<T>(type: "start", fn: (this: T, arg: Event) => void, isPre?: boolean): void
    on<T>(type: "move" | "end", fn: (this: T, arg: { x: number; y: number; event: Event }) => void, isPre?: boolean): void
    on<T>(type: string, fn: (this: T, arg: any) => void, isPre: boolean = false): void {
        this[":on"](type, fn, isPre)
    }

    // 初始化
    constructor(id: string | HTMLElement, mx?: number, my?: number) {
        super()
        if (typeof id == "string") {
            let x = doc.getElementById(id)
            if (x) {
                id = x
            }
        }
        if (!id) {
            // eslint-disable-next-line
            throw "no id element"
        }
        this.dom = id as HTMLElement

        if (mx) {
            this.mx = mx
        }
        if (my) {
            this.my = my
        }

        appendEvent(this.dom, "down", slipDown.bind(this), false)
    }

    // 清理
    setSkewing(x: number, y: number): [number, number] {
        this.ax = getMax(this.mx, x || 0)
        this.ay = getMax(this.my, y || 0)
        return [this.ax, this.ay]
    }
}
