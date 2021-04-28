import { VueConstructor } from "vue";
import { App } from "vue3";
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
    vue: VueConstructor | App;
}
declare module "vue/types/options" {
    interface ComponentOptions<V extends Vue> {
        life?: IVueLiveHookOption;
    }
}
declare module "vue" {
    interface ComponentCustomOptions {
        life?: IVueLiveHookOption;
    }
}
export declare function vueLifeInstall(V: VueConstructor | App, init: Function | IVueLiveInitObj): void;
export default vueLifeInstall;
