/**
 * unicom 联通 想到中国联通就想到了这个名字 -_-
 * 目的，提供vue 全局的转发机制
 * [2019-07-21] 重构,以事件模型为基础,多组件之间 订阅者和发布者来制作
 */
import { VueConstructor } from "vue";
export declare class VueUnicomEvent {
    from: any;
    target: any;
    data: any;
    [propName: string]: any;
    constructor(from: any, args: Array<any>);
}
export interface vueUnicomArg {
    id?: string;
    group?: string | Array<string>;
    target?: any;
}
export declare class VueUnicom {
    static install: Function;
    private _instruct_;
    target: any;
    id: string;
    group: Array<string>;
    private _monitor_back_;
    constructor({ id, group, target }?: vueUnicomArg);
    monitorBack(): VueUnicom;
    monitor(instruct: string, callback: Function): VueUnicom;
    monitorOff(instruct?: string, callback?: Function): VueUnicom;
    destroy(): void;
    setId(id: string): VueUnicom;
    setGroup(group: string | string[]): this;
    has(type: string): boolean;
    on(type: string, fun: Function): VueUnicom;
    off(type?: string, fun?: Function): VueUnicom;
    emit(query: string, ...args: any): any;
}
export interface vueUnicomInstallArg {
    name?: string;
    unicomName?: string;
    unicomId?: string;
    unicomEmit?: string;
    unicomClass?: string;
}
export declare function vueUnicomInstall(vue: VueConstructor, { name, unicomName, unicomId, unicomEmit, unicomClass }?: vueUnicomInstallArg): void;
export default VueUnicom;
