let traceDom: HTMLElement,
    tarceI: number,
    tc = ["#F00", "#0F0", "#00F", "#FF0", "#F0F", "#0FF"],
    cc = ["#FFF", "#000", "#FFF", "#000", "#FFF", "#000"]

export default function debug(...args: any[]) {
    if (!traceDom) {
        tarceI = 0
        traceDom = document.createElement("div")
        traceDom.style.cssText = "position:absolute; top:0; left:0; right:0; z-index:999999999;"
        traceDom.onclick = function(ev) {
            traceDom.innerHTML = ""
            ev.stopPropagation()
        }
        if (document.body) {
            if (document.body.firstChild) {
                document.body.insertBefore(traceDom, document.body.firstChild)
            } else {
                document.body.appendChild(traceDom)
            }
        } else {
            document.documentElement.appendChild(traceDom)
        }
    }
    let strs = []
    for (let i = 0; i < args.length; i += 1) {
        strs.push(JSON.stringify(args[i]))
    }
    let div = document.createElement("div")
    div.style.cssText = "padding: 5px; color:" + cc[tarceI] + "; word-wrap: break-word; background-color:" + tc[tarceI++]
    div.innerHTML = strs.join(" ， ")
    traceDom.appendChild(div)
    tarceI = tarceI % tc.length
}

window.onerror = function($1, $2, $3) {
    debug(String($1) + ":::" + String($2) + ":::" + String($3))
}
