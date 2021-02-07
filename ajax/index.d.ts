import { AjaxGroup, fixedURL, getParamString } from "./lib";
export * from "./lib";
export declare let ajaxUtil: {
    fixedURL: typeof fixedURL;
    toParam: typeof getParamString;
};
declare let def: AjaxGroup & {
    global: import("./lib").Global;
    Group: typeof AjaxGroup;
    util: {
        fixedURL: typeof fixedURL;
        toParam: typeof getParamString;
    };
};
export default def;
