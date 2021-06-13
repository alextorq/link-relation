const worker = new Worker('./worker.ts', { type: 'module' });

const send = message => worker.postMessage({
    message
})

export default {
    worker,
    send
}
