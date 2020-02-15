// 清理dist中的文件夹的

let fs = require("fs")
let path = require("path")

function clean(file, isFirst) {
    if (fs.lstatSync(file).isDirectory()) {
        let flg = true
        fs.readdirSync(file).forEach(item => {
            if (item == "node_modules" || /^[\._]/.test(item) || (!clean(path.join(file, item), file === __dirname) && flg)) {
                flg = false
            }
        })
        if (flg) {
            fs.rmdirSync(file)
            return true
        }
        return false
    }
    if (isFirst) {
        return false
    }
    fs.unlinkSync(file)
    return true
}

clean(__dirname)
