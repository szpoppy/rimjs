"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var traceDom, tarceI, tc = ["#F00", "#0F0", "#00F", "#FF0", "#F0F", "#0FF"], cc = ["#FFF", "#000", "#FFF", "#000", "#FFF", "#000"];
function debug() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (!traceDom) {
        tarceI = 0;
        traceDom = document.createElement("div");
        traceDom.style.cssText = "position:absolute; top:0; left:0; right:0; z-index:999999999;";
        traceDom.onclick = function (ev) {
            traceDom.innerHTML = "";
            ev.stopPropagation();
        };
        if (document.body) {
            if (document.body.firstChild) {
                document.body.insertBefore(traceDom, document.body.firstChild);
            }
            else {
                document.body.appendChild(traceDom);
            }
        }
        else {
            document.documentElement.appendChild(traceDom);
        }
    }
    var strs = [];
    for (var i = 0; i < args.length; i += 1) {
        strs.push(JSON.stringify(args[i]));
    }
    var div = document.createElement("div");
    div.style.cssText = "padding: 5px; color:" + cc[tarceI] + "; word-wrap: break-word; background-color:" + tc[tarceI++];
    div.innerHTML = strs.join(" ， ");
    traceDom.appendChild(div);
    tarceI = tarceI % tc.length;
}
exports.default = debug;
window.onerror = function ($1, $2, $3) {
    debug(String($1) + ":::" + String($2) + ":::" + String($3));
};
//# sourceMappingURL=index.js.map