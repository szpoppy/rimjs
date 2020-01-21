/**
 * unicom 联通 想到中国联通就想到了这个名字 -_-
 * 目的，提供vue 全局的转发机制
 * [2019-07-21] 重构,以事件模型为基础,多组件之间 订阅者和发布者来制作
 */
import { VueConstructor } from "vue";
interface unicomArg {
    id?: string;
    group?: string | Array<string>;
    target?: any;
}
export declare class Unicom {
    static install: Function;
    private _instruct_;
    target: any;
    id: string;
    group: Array<string>;
    private _monitor_back_;
    constructor({ id, group, target }?: unicomArg);
    monitorBack(): Unicom;
    monitor(instruct: string, callback: Function): Unicom;
    monitorOff(instruct?: string, callback?: Function): Unicom;
    destroy(): void;
    setId(id: string): Unicom;
    setGroup(group: string | string[]): this;
    has(type: string): boolean;
    on(type: string, fun: Function): Unicom;
    off(type?: string, fun?: Function): Unicom;
    emit(query: string, ...args: any): any;
}
interface unicomInstallArg {
    name?: string;
    unicomName?: string;
    unicomId?: string;
    unicomEmit?: string;
    unicomClass?: string;
}
export declare function install(vue: VueConstructor, { name, unicomName, unicomId, unicomEmit, unicomClass }?: unicomInstallArg): void;
export default Unicom;
