/* 
function getDefaultAdapter() {
    var adapter;
    if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = require('./adapters/xhr');
    } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // For node use HTTP adapter
        adapter = require('./adapters/http');
    }
    return adapter;
}
*/
import { AjaxGroup, ajaxGlobal, fixedURL, getParamString } from "./lib"
export * from "./lib"

export let ajaxUtil = {
    fixedURL,
    toParam: getParamString
}
require(typeof process !== "undefined" && Object.prototype.toString.call(process) === "[object process]"
    ? // node
      "./node-http"
    : // 浏览器
      "./browser")

export let ajax = Object.assign(new AjaxGroup(), { global: ajaxGlobal, Group: AjaxGroup, util: ajaxUtil })
export default ajax
