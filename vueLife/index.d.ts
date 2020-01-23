import { VueConstructor } from "vue";
/**
 * 初始化传入参数
 */
export interface vueLiveInitObj {
    init: Function;
    hookDef?: string;
    hooks?: object;
    prepose?: string;
    lifeName?: string;
    args?: Array<any> | any;
}
export interface vueLiveHook {
    that: any;
    ready: any;
    data: any;
    callback?: Function;
}
export interface vueLiveHookEvent {
    data: any;
    emit: Function;
    then: Function;
}
export declare function vueLifeInstall(Vue: VueConstructor, init: Function | vueLiveInitObj): void;
export default vueLifeInstall;
