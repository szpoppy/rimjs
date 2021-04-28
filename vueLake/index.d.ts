/**
 * [2020-09-07] 开发
 */
import Vue, { VueConstructor } from "vue";
import { App } from "vue3";
import Lake, { LakeEvent, lakeProt } from "../lake";
export * from "../lake";
export interface IVueLakeBackOption {
    [propName: string]: <V extends Vue, D>(this: V, arg: LakeEvent<D>, next: () => Promise<void>) => void;
}
interface vueInstruct {
    [propName: string]: (arg: LakeEvent) => void;
}
interface vueLakeData {
    isIgnore: boolean;
    initGroup?: Array<string>;
    instructs?: Array<vueInstruct>;
    lake?: Lake;
}
declare module "vue/types/options" {
    interface ComponentOptions<V extends Vue> {
        lakeId?: string;
        lakeName?: string | string[];
        lakeSubs?: IVueLakeBackOption;
    }
}
declare module "vue/types/vue" {
    interface Vue {
        $lake: typeof lakeProt;
        _lake_data_?: vueLakeData;
    }
}
declare module "vue" {
    interface ComponentCustomProperties {
        $lake: typeof lakeProt;
        _lake_data_?: vueLakeData;
    }
    interface ComponentCustomOptions {
        lakeId?: string;
        lakeName?: string | string[];
        lakeSubs?: IVueLakeBackOption;
    }
}
export declare function vueLakeInstall(V: VueConstructor | App): void;
export default Lake;
