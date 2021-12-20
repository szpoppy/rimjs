const { ajax, NodeFormData } = require("./ajax")
const path = require("path")
const fs = require("fs")
const http = require("http")
const url = require("url")

let c = {
    // 上传身份
    userToken: "5caee640636feb0007ac2316",
    assetKey: "5caee643636feb0007ac2318",
    // 上传url 一般固定
    api: "http://leonidapi.17usoft.com/libraapi2/leonid/v2/static/object",
    // 狮子座项目名称
    bucket: "cvgfront-common",
    // 子目录
    bucketPath: "test"
}

let img = path.join(__dirname, "_src", "ajax", "imgs", "te.png")

// "user-token": this.params.userToken,
// "asset-key": this.params.assetKey

function rimUp() {
    console.log(img)

    let formData = new NodeFormData()
    formData.set("bucket_name", c.bucket)
    formData.set("key", "/test/rimjs/")

    formData.set("file", { url: img })

    ajax.load(
        {
            url: c.api,
            header: {
                "user-token": c.userToken,
                "asset-key": c.assetKey
            }
        },
        function({ res }) {
            console.log("res", res)
        },
        formData
    )
}

function upload(file, dirname) {
    let boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    // let URL = url.parse(c.api)
    // let self = this
    // eslint-disable-next-line
    let options = {
        method: "POST",
        // hostname: URL.hostname,
        // path: URL.path,
        headers: {
            "Content-Type": "multipart/form-data; boundary=" + boundary,
            "user-token": c.userToken,
            "asset-key": c.assetKey
        }
    }

    let filename = path.basename(file)
    let mime = "application/octet-stream"

    // console.log("cdn upload", options)
    let request = http.request(c.api, options, function(res) {
        let chunks = []
        res.on("data", chunk => {
            chunks.push(chunk)
        })
        res.on("end", () => {
            let body = Buffer.concat(chunks)
            // console.log("cdn upload end", body.toString())
            let jsonRes
            try {
                jsonRes = JSON.parse(body.toString())
                // console.log('返回结果===>' + JSON.stringify(jsonRes))
            } catch (e) {
                console.log("error end", e)
            }
            console.log(jsonRes)
        })

        res.on("error", e => {
            console.log("error res", e)
            // reject(e)
        })
    })
    request.on("error", function(e) {
        console.log("error request", e)
        // reject(e)
    })
    let fileStream = fs.createReadStream(file)

    let f = `--${boundary}\r\nContent-Disposition: form-data; name="bucket_name"\r\n\r\n${c.bucket}\r\n--${boundary}\r\nContent-Disposition: form-data; name="key"\r\n\r\n${dirname.replace(/\\/g, "/")}\r\n--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${mime}\r\n\r\n`
    console.log(f)
    request.write(f)

    fileStream.pipe(request, { end: false })

    fileStream.on("end", () => {
        console.log("end", `\r\n--${boundary}--`)

        request.end(`\r\n--${boundary}--`)
    })

    fileStream.on("error", e => {
        console.log("error fileStream", e)
        // console.log(e);

        // reject(e)
    })
}

// upload(img, "/test/rimjs/")
rimUp()
