import { getFullUrl } from "../util/getFullUrl";
import { loadJS } from "../util/loadJS";
import { AjaxGroup, fixedURL, getParamString } from "./lib";
export * from "./lib";
export declare let ajaxUtil: {
    fixedURL: typeof fixedURL;
    toParam: typeof getParamString;
    loadJS: typeof loadJS;
    getFullUrl: typeof getFullUrl;
};
declare let def: AjaxGroup & {
    global: import("./lib").Global;
    Group: typeof AjaxGroup;
    util: {
        fixedURL: typeof fixedURL;
        toParam: typeof getParamString;
        loadJS: typeof loadJS;
        getFullUrl: typeof getFullUrl;
    };
};
export default def;
