import EventEmitter from "../event";
declare class TimeEventData {
    diff: string;
    spt: number;
}
declare type timeType = string | number | boolean | Date;
declare class TimeEvent extends EventEmitter {
    endNum: number;
    prevNum: number;
    diffText: string;
    isStop: boolean;
    toStop: boolean;
    constructor(time?: timeType, diffText?: string);
    on(type: "change" | "end", fn: (arg: TimeEventData) => void, isPre?: boolean): TimeEvent;
    setEndNum(time: string | number | boolean | Date): void;
    emitDiff(): boolean;
    stop(): void;
    getNow(): Date;
}
/**
 * 倒计时 函数
 * @param {Number|String|Date} time 为数字时，代表，需要执行多少秒的倒计时
 * @return {eventemitter} 自定义事件对象
 * @event change 事件，剩余时间 改变时触发，两个参数 第一个 diff 字符串 第二个diff（秒）
 * @event end 倒计时结束时候调用
 */
declare function timeDown(time: string | number | boolean | Date, diffText?: string): TimeEvent;
/**
 * 设置默认的 获取当前时间的函数
 * @param {Function} fn
 */
declare function setGetNowFn(fn: () => Date): typeof timeDown;
/**
 * 终止
 */
declare function stopAll(): void;
declare const _default: typeof timeDown & {
    stopAll: typeof stopAll;
    setGetNowFn: typeof setGetNowFn;
};
export default _default;
