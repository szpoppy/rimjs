/**
 * 事件类
 */

interface eventObj {
    [propName: string]: Function[]
}

function emitEvent(events:Function[], target:Event, args:any[]):any {
    for (let i = 0; i < events.length; i += 1) {
        events[i].apply(target, args)
    }
}

export default class Event {
    private _events: eventObj
    parent?: Event
    constructor(parent?: Event) {
        this._events = {}
        if (parent) {
            this.parent = parent
        }
    }

    /**
     * 绑定事件
     * @param type 事件名称
     * @param fn 事件函数
     * @param isPre 是否前面插入
     */
    on(type: string, fn: Function, isPre: boolean = false): Event {
        let evs = this._events[type]
        if (!evs) {
            evs = this._events[type] = []
        }
        evs[isPre ? "unshift" : "push"](fn)
        return this
    }

    /**
     * 移除事件 可以移除全部事件
     * @param type
     * @param fn
     */
    off(type?: string, fn?: Function): Event {
        if (!type) {
            this._events = {}
            return this
        }
        if (!fn) {
            delete this._events[type]
            return this
        }
        let evs = this._events[type]
        if (!evs) {
            return this
        }
        let index = evs.indexOf(fn)
        if (index >= 0) {
            evs.splice(index, 1)
        }
        return this
    }

    /**
     * 内部调用 事件触发函数
     * @param target 
     * @param type 
     * @param args 
     */
    emit(target:Event|string, type:string | any, ...args:any[]):any {
        if(typeof target == "string") {
            args.unshift(type)
            type = target
            target = this
        }

        let parent = this.parent
        if (parent && parent.emit) {
            parent.emit(target, type, ...args)
        }
        let evs = this._events[type] || []
        for (let i = 0; i < evs.length; i += 1) {
            evs[i].apply(target, args)
        }

        return args[0]
    }

    /**
     * 判断事件是否存在
     * @param type
     */
    hasEvent(type: string): boolean {
        let evs = this._events[type] || []
        return evs.length > 0
    }
}
