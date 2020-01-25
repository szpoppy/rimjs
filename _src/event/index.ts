/**
 * 事件类
 */

export interface IEventFn<T, A> extends Function {
    (this: T, arg: A): void
}

interface IFEventObj<T, A> {
    [propName: string]: IEventFn<T, A>[]
}
export default class Event<T = null, A = any> {
    private _events?: IFEventObj<T, A>
    private _parent?: Event<T, A>
    constructor(parent?: Event<T, A>) {
        this._events = {}
        if (parent) {
            this._parent = parent
        }
    }

    /**
     * 绑定事件
     * @param type 事件名称
     * @param fn 事件函数
     * @param isPre 是否前面插入
     */
    on(type: string, fn: IEventFn<T, A>, isPre: boolean = false): void {
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
    off(type?: string, fn?: IEventFn<T, A>): void {
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

    private _emit(target: Event<T, A>, type: string, arg?: A): A {
        if (this._parent && this._parent._emit) {
            this._parent._emit(target, type, arg)
        }

        let evs = this._events[type] || []
        for (let i = 0; i < evs.length; i += 1) {
            evs[i].call(target, arg)
        }

        return arg
    }

    /**
     * 内部调用 事件触发函数
     * @param target
     * @param type
     * @param args
     */
    emit(type: string, arg?: A): A {
        return this._emit(this, type, arg)
    }

    /**
     * 判断事件是否存在
     * @param type
     */
    hasEvent(type: string): boolean {
        let target: Event<T, A> = this
        do {
            let evs = target._events[type] || []
            if (evs.length > 0) {
                return true
            }
        } while ((target = target._parent))
        return false
    }
}