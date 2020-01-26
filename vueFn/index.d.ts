import Vue, { VueConstructor, ComponentOptions, Component, AsyncComponent, DirectiveFunction, DirectiveOptions, PropOptions, ComputedOptions, WatchOptionsWithHandler, WatchHandler } from "vue";
interface IVue extends Vue {
    [propName: string]: any;
}
interface IPluginArg {
    after(afterFn: IFnArgFn): void;
    fnArg: IFnArgs;
    lifecycle: any;
    makeLifecycle: any;
    quickSet: any;
    quickNext: any;
    setQuickNextExec: (key: string) => void;
    merges: any;
    extData: any;
}
interface IPluginFn {
    (pluginArg: IPluginArg): void;
}
interface IFnArgFn {
    (arg: IFnArgs): void;
}
interface IModel {
    prop?: string;
    event?: string;
}
interface IOptions<T> {
    (key: string | Record<string, T>, val?: T): void;
}
interface ILifecycle {
    (fn: (this: IVue, ext?: IVueFnExtVal) => void, isExt?: boolean): void;
}
interface ILifecycleByKey {
    (key: string, fn: ILifecycle): void;
}
declare type Accessors<T> = {
    [K in keyof T]: (() => T[K]) | ComputedOptions<T[K]>;
};
interface IFnArgs {
    $set: (prot?: string | execOptions, val?: any) => execOptions | undefined;
    $name: (name: string) => void;
    $mixins: (mixin: ComponentOptions<Vue> | typeof Vue) => void;
    $components: IOptions<Component<any, any, any, any> | AsyncComponent<any, any, any, any>>;
    $directives: IOptions<DirectiveFunction | DirectiveOptions>;
    $props: IOptions<PropOptions<any>>;
    $data: IOptions<any>;
    $setup: IOptions<any>;
    $computed: IOptions<Accessors<{
        [key: string]: any;
    }>>;
    $filters: IOptions<Function>;
    $model: (model: IModel) => void;
    $watch: IOptions<WatchOptionsWithHandler<any> | WatchHandler<any> | string>;
    $methods: IOptions<(this: IVue, ...args: any[]) => any>;
    $lifecycle: ILifecycleByKey;
    $created: ILifecycle;
    $mounted: ILifecycle;
    $destroyed: ILifecycle;
    $nextTick: (callback: () => void) => void;
    $emit: (...args: any) => void;
    $: (fn: IBindInFn | IBindInFnObj | IBindInFn[]) => IBindFn | IBindFnObj | IBindFn[];
    $getExt: (vm: IVue) => IVueFnExtVal | null;
    $setExt: (key: string | IAnyObj, val?: any) => void;
    $export: exportFn;
}
interface IBindInFn {
    (ext: IVueFnExtVal, ...args: any[]): any;
}
interface IBindInFnObj {
    [propName: string]: IBindInFn;
}
interface IBindFn extends Function {
    __$ext?: boolean;
}
interface IBindFnObj {
    [propName: string]: IBindFn;
}
interface IAnyObj {
    [propName: string]: any;
}
export interface IVueFnExtVal {
    vm: IVue;
    temp: IAnyObj;
    get: (key: string) => any;
    set: (key: string, val: any) => void;
    [propName: string]: any;
}
/**
 * 插件注册
 * @param initFn
 */
export declare function vueFnOn(initFn: IPluginFn): void;
/**
 * vue install 函数
 * @param vue
 * @param initFn
 */
export declare function vueFnInstall(vue: VueConstructor, initFn?: IPluginFn): void;
interface execOptions extends ComponentOptions<Vue> {
    [propName: string]: any;
}
interface exportFn extends Function {
    options?: execOptions;
}
export declare function vueFn(): IFnArgs;
export declare namespace vueFn {
    var on: typeof vueFnOn;
    var install: typeof vueFnInstall;
}
export default vueFn;
