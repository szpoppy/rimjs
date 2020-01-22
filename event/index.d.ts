/**
 * 事件类
 */
export default class Event {
    private _events;
    constructor();
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
     * 触发事件
     * @param type
     * @param arg
     */
    emit(type: string, ...arg: any): any;
    /**
     * 判断事件是否存在
     * @param type
     */
    has(type: string): boolean;
}
