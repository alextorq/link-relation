const WorkerPlugin = require('worker-plugin')

module.exports = {
    lintOnSave: false,
    configureWebpack: {
        output: {
            globalObject: "this"
        },
        plugins: [
            new WorkerPlugin()
        ]
    }
}
