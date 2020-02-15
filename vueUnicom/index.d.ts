/**
 * unicom 联通 想到中国联通就想到了这个名字 -_-
 * 目的，提供vue 全局的转发机制
 * [2019-07-21] 重构,以事件模型为基础,多组件之间 订阅者和发布者来制作
 */
import Vue, { VueConstructor } from "vue";
export declare class VueUnicomEvent<D = any, T = any> {
    from: any;
    target: T;
    data: D;
    [propName: string]: any;
    constructor(from: any, args: Array<any>);
}
export declare type VueUnicomEmitBack<D, T = any> = VueUnicomEvent<D, T> | VueUnicom | VueUnicom[];
export declare function unicomEmit<D>(query: string, data?: D, args?: any[]): VueUnicomEmitBack<D, any>;
export interface vueUnicomArg {
    id?: string;
    group?: string | Array<string>;
    target?: any;
}
export interface IVueUnicomBackOption {
    [propName: string]: (arg: VueUnicomEvent) => void;
}
declare module "vue/types/options" {
    interface ComponentOptions<V extends Vue> {
        unicomId?: string;
        unicomName?: string | string[];
        unicom?: IVueUnicomBackOption;
    }
}
declare module "vue/types/vue" {
    interface Vue {
        $unicom: <D>(query: string, data?: D, ...args: any) => VueUnicomEmitBack<D, Vue>;
        _unicom_data_?: vueUnicomData;
    }
}
export declare type IVueUnicomBackFn = (key: string, fn: (arg: VueUnicomEvent) => void) => void;
export declare class VueUnicom {
    static install: typeof vueUnicomInstall;
    private _instruct_;
    target: any;
    id: string;
    group: Array<string>;
    static emit: typeof unicomEmit;
    private _monitor_back_;
    constructor({ id, group, target }?: vueUnicomArg);
    monitorBack(): VueUnicom;
    monitor(instruct: string, callback: Function): VueUnicom;
    monitorOff(instruct?: string, callback?: Function): VueUnicom;
    destroy(): void;
    setId(id: string): VueUnicom;
    setGroup(group: string | string[]): this;
    has(type: string): boolean;
    on(type: string, fn: IVueUnicomBackFn): VueUnicom;
    off(type?: string, fn?: IVueUnicomBackFn): VueUnicom;
    emit<D>(query: string, data?: D, ...args: any): VueUnicomEmitBack<D>;
}
interface vueInstruct {
    [propName: string]: IVueUnicomBackFn;
}
interface vueUnicomData {
    isIgnore: boolean;
    initGroup?: Array<string>;
    instructs?: Array<vueInstruct>;
    unicom?: VueUnicom;
}
export declare function vueUnicomInstall(vue: VueConstructor): void;
export default VueUnicom;
