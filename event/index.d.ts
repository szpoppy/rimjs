/**
 * 事件类
 */
export interface IEventFn<T = any> {
    (this: T, arg: any): void;
}
export default class Event {
    private _events;
    private _parent;
    constructor(parent?: any);
    once<T>(type: string, fn: IEventFn<T>, isPre?: boolean): void;
    on<T>(type: string, fn: IEventFn<T>, isPre?: boolean): void;
    /**
     * 绑定事件
     * @param type 事件名称
     * @param fn 事件函数
     * @param isPre 是否前面插入
     */
    ":on"<T>(type: string, fn: IEventFn<T>, isPre?: boolean): void;
    /**
     * 移除事件 可以移除全部事件
     * @param type
     * @param fn
     */
    off(type?: string, fn?: IEventFn): void;
    /**
     * 内部调用 事件触发函数
     * @param target
     * @param type
     * @param args
     */
    private ":emit";
    emit<R>(type: string, arg: R): R;
    /**
     * 判断事件是否存在
     * @param type
     */
    hasEvent(type: string): boolean;
}
