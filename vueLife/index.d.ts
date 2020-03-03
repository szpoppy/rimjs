import { VueConstructor } from "vue";
/**
 * 初始化传入参数
 */
export interface IVueLiveInitObj {
    init: Function;
    hookDef?: string;
    hooks?: object;
    prepose?: string;
    args?: Array<any> | any;
}
export interface IVueLiveHookEvent<T = any> {
    data: T;
    emit: (key: string, data: any) => void;
    then: (fn: () => void) => void;
}
export interface IVueLiveHookOptionFn {
    <T>(arg: IVueLiveHookEvent<T>): void;
}
export interface IVueLiveHookOption {
    [propName: string]: IVueLiveHookOptionFn;
}
export interface IVueLifeInitFnArg {
    emit<T>(key: string, data?: T): T | undefined;
    hooks: {
        [propName: string]: string;
    };
    vue: VueConstructor;
}
declare module "vue/types/options" {
    interface ComponentOptions<V extends Vue> {
        life?: IVueLiveHookOption;
    }
}
export declare function vueLifeInstall(Vue: VueConstructor, init: Function | IVueLiveInitObj): void;
export default vueLifeInstall;
