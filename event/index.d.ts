/**
 * 事件类
 */
export interface IEventFn<T, A> extends Function {
    (this: T, arg: A): void;
}
export default class Event<T = null, A = any> {
    private _events?;
    private _parent?;
    constructor(parent?: Event<T, A>);
    /**
     * 绑定事件
     * @param type 事件名称
     * @param fn 事件函数
     * @param isPre 是否前面插入
     */
    on(type: string, fn: IEventFn<T, A>, isPre?: boolean): void;
    /**
     * 移除事件 可以移除全部事件
     * @param type
     * @param fn
     */
    off(type?: string, fn?: IEventFn<T, A>): void;
    private _emit;
    /**
     * 内部调用 事件触发函数
     * @param target
     * @param type
     * @param args
     */
    emit(type: string, arg?: A): A;
    /**
     * 判断事件是否存在
     * @param type
     */
    hasEvent(type: string): boolean;
}
