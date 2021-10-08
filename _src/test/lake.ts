import Lake from "../vueLake"

let lake = new Lake()

lake.sub("tt", function({ data }) {
    data.x = 1
})

lake.sub<{ y: number; z: number }>("tt", async function(this: Lake<void>, { data }, next) {
    data.y = 1

    await next()

    data.z = 100
})

lake.sub("tt", async function({ data }, next) {
    data.z = 2

    await next()

    data.z = 50
})

async function doExe() {
    // 输出 {data:{x:1, z: 1, y: 100}}
    console.log(await lake.pub("tt"))
}

doExe()
