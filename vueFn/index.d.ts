import Vue, { VueConstructor, ComponentOptions } from "vue";
/**
 * 插件注册
 * @param initFn
 */
export declare function vueFnOn(initFn: Function): void;
/**
 * vue install 函数
 * @param vue
 * @param initFn
 */
export declare function vueFnInstall(vue: VueConstructor, initFn: Function): void;
interface execOptions extends ComponentOptions<Vue> {
    [propName: string]: any;
}
interface exportFn extends Function {
    options?: execOptions;
}
export interface fnArgs {
    $set: Function;
    $name: Function;
    $mixins: Function;
    $components: Function;
    $directives: Function;
    $props: Function;
    $data: Function;
    $setup: Function;
    $computed: Function;
    $filters: Function;
    $model: Function;
    $watch: Function;
    $methods: Function;
    $lifecycle: Function;
    $created: Function;
    $mounted: Function;
    $destroyed: Function;
    $nextTick: Function;
    $emit: Function;
    $: Function;
    $getExt: Function;
    $setExt: Function;
    $export?: exportFn;
}
export declare function vueFn(initFn: Function): fnArgs | execOptions;
export declare namespace vueFn {
    var on: typeof vueFnOn;
    var install: typeof vueFnInstall;
}
export default vueFn;
