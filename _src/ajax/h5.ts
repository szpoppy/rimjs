import { AjaxGroup, ajaxGlobal, fixedURL, getParamString } from "./lib"
import "./browser"
export * from "./lib"

export let ajaxUtil = {
    fixedURL,
    toParam: getParamString
}

export let ajax = Object.assign(new AjaxGroup(), { global: ajaxGlobal, Group: AjaxGroup, util: ajaxUtil })
export default ajax
