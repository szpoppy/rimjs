import Vue, { ComponentOptions, Component, AsyncComponent, DirectiveFunction, DirectiveOptions, PropOptions, ComputedOptions, WatchOptionsWithHandler, WatchHandler } from "vue";
interface IAnyObj {
    [propName: string]: any;
}
export interface IVueFnExtVal {
    vm: IVue;
    temp: IAnyObj;
    get: (key: string) => any;
    set: (key: string | IAnyObj, val?: any) => void;
    [propName: string]: any;
}
interface IVue extends Vue {
    [propName: string]: any;
}
interface IOnExportFn {
    (): void;
}
export interface IVueFnPluginArg {
    onExport(fn: IOnExportFn): void;
    lifecycle: any;
    makeLifecycle: any;
    quickSet: any;
    merges: any;
    extData: any;
}
interface IModel {
    prop?: string;
    event?: string;
}
interface IOptions<T> {
    (key: string | Record<string, T>, val?: T): void;
}
interface ILifecycle {
    (fn: (this: IVue, ext: IVueFnExtVal) => void, isExt: true): void;
    (fn: (this: IVue) => void, isExt: false): void;
    (fn: (this: IVue) => void): void;
}
interface ILifecycleByKey {
    (key: string, fn: (this: IVue, ext: IVueFnExtVal) => void, isExt: true): void;
    (key: string, fn: (this: IVue) => void, isExt: false): void;
    (key: string, fn: (this: IVue) => void): void;
}
declare type Accessors<T> = {
    [K in keyof T]: (() => T[K]) | ComputedOptions<T[K]>;
};
export interface IVueFnArg {
    plugin: <T>(plug: (plug: IVueFnPluginArg, arg: IVueFnArg) => T) => T;
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
    $: (fn: IBindInFn | IBindInFnObj | IBindInFn[]) => IBindFn | IBindFnObj | IBindFn[];
    $getExt: (vm: IVue) => IVueFnExtVal | null;
    $setExt: (key: string | IAnyObj, val?: any) => void;
    $export: () => ComputedOptions<IVue>;
    [propName: string]: any;
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
interface execOptions extends ComponentOptions<Vue> {
    [propName: string]: any;
}
export declare function vueFn(): IVueFnArg;
export default vueFn;
