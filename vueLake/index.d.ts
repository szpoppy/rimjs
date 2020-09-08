/**
 * [2020-09-07] 开发
 */
import Vue, { VueConstructor } from "vue";
export declare class VueLakeEvent<D = any> {
    from: VueLake | null;
    data: D;
    [propName: string]: any;
    constructor(from: VueLake | null, data: D);
}
export declare type VueLakeEmitBack<D> = VueLakeEvent<D> | VueLake | VueLake[];
export declare function lakePub<D>(query: string, data?: D): Promise<VueLakeEmitBack<D>>;
export interface IVueLakeArg<T> {
    id?: string;
    group?: string | Array<string>;
    target?: T;
}
interface vueLakeInstruct {
    [propName: string]: Function[];
}
export interface IVueLakeBackOption {
    [propName: string]: <V extends Vue, D>(this: V, arg: VueLakeEvent<D>, next: () => Promise<void>) => void;
}
declare module "vue/types/options" {
    interface ComponentOptions<V extends Vue> {
        lakeId?: string;
        lakeName?: string | string[];
        lakeSubs?: IVueLakeBackOption;
    }
}
interface IVueLakeProt {
    <D>(query: string, data?: D): Promise<VueLakeEmitBack<D>>;
    id(id: string): VueLake;
    group(name: string): VueLake[];
}
declare module "vue/types/vue" {
    interface Vue {
        $lake: IVueLakeProt;
        _lake_data_?: vueLakeData;
    }
}
export declare class VueLake<T = any> {
    static install: typeof vueLakeInstall;
    protected _instruct_: vueLakeInstruct;
    target: T | VueLake;
    id: string;
    group: Array<string>;
    static pub: typeof lakePub;
    static getId: (id: string) => VueLake<any>;
    static getGroup: (name: string) => VueLake<any>[];
    protected _monitor_back_: number;
    constructor({ id, group, target }?: IVueLakeArg<T>);
    protected listenExec(): VueLake;
    listen(instruct: string, callback: Function): VueLake;
    unListen(instruct?: string, callback?: Function): VueLake;
    destroy(): void;
    setId(id: string): VueLake;
    setGroup(group: string | string[]): this;
    has(type: string): boolean;
    sub<D = any>(type: string, fn: (arg: VueLakeEvent<D>, next: () => Promise<void>) => void): VueLake;
    unSub(type?: string, fn?: Function): VueLake;
    pub<D>(query: string, data?: D): Promise<VueLakeEmitBack<D>>;
}
interface vueInstruct {
    [propName: string]: (arg: VueLakeEvent) => void;
}
interface vueLakeData {
    isIgnore: boolean;
    initGroup?: Array<string>;
    instructs?: Array<vueInstruct>;
    lake?: VueLake;
}
export declare function vueLakeInstall(Vue: VueConstructor): void;
export default VueLake;
