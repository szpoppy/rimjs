/**
 * 事件类
 */
export default class Event {
    private _events;
    parent?: Event;
    constructor(parent?: Event);
    /**
     * 绑定事件
     * @param type 事件名称
     * @param fn 事件函数
     * @param isPre 是否前面插入
     */
    on(type: string, fn: Function, isPre?: boolean): Event;
    /**
     * 移除事件 可以移除全部事件
     * @param type
     * @param fn
     */
    off(type?: string, fn?: Function): Event;
    /**
     * 内部调用 事件触发函数
     * @param target
     * @param type
     * @param args
     */
    emit(target: Event | string, type: string | any, ...args: any[]): any;
    /**
     * 判断事件是否存在
     * @param type
     */
    hasEvent(type: string): boolean;
}
