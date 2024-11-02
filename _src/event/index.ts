/**
 * 事件类
 */

export interface IEventFn<T = any> {
    (this: T, arg: any): void
}

interface IFEventObj {
    [propName: string]: IEventFn[]
}
export default class Event {
    private _events: IFEventObj = {}
    private _parent: any = null
    constructor(parent?: any) {
        this._events = {}
        if (parent) {
            this._parent = parent
        }
    }

    once<T>(type: string, fn: IEventFn<T>, isPre: boolean = false): void {
        function back() {
            fn.apply(this, arguments)
            this.off(type, back)
        }
        back.__isOnce = true
        this[":on"](type, back, isPre)
    }

    on<T>(type: string, fn: IEventFn<T>, isPre: boolean = false): void {
        this[":on"](type, fn, isPre)
    }

    /**
     * 绑定事件
     * @param type 事件名称
     * @param fn 事件函数
     * @param isPre 是否前面插入
     */
    ":on"<T>(type: string, fn: IEventFn<T>, isPre: boolean = false): void {
        let evs = this._events[type]
        if (!evs) {
            evs = this._events[type] = []
        }
        evs[isPre ? "unshift" : "push"](fn)
    }

    /**
     * 移除事件 可以移除全部事件
     * @param type
     * @param fn
     */
    off(type?: string, fn?: IEventFn): void {
        if (!type) {
            this._events = {}
            return
        }
        if (!fn) {
            delete this._events[type]
            return
        }
        let evs = this._events[type]
        if (!evs) {
            return
        }
        let index = evs.indexOf(fn)
        if (index >= 0) {
            evs.splice(index, 1)
        }
    }

    /**
     * 内部调用 事件触发函数
     * @param target
     * @param type
     * @param args
     */
    private ":emit"<R, T>(target: T, type: string, arg: R): R {
        if (this._parent && this._parent[":emit"]) {
            this._parent[":emit"](target, type, arg)
        }

        let evs = this._events[type] || []
        for (let i = 0; i < evs.length;) {
            let fn = evs[i] as any
            fn.call(target, arg)
            if (!fn.__isOnce) {
                i += 1
            }
        }

        return arg
    }

    // 事件触发
    emit<R>(type: string, arg: R): R {
        return this[":emit"](this, type, arg)
    }

    /**
     * 判断事件是否存在
     * @param type
     */
    hasEvent(type: string): boolean {
        let target: Event = this
        do {
            let evs = target._events[type] || []
            if (evs.length > 0) {
                return true
            }
        } while ((target = target._parent))
        return false
    }
}
