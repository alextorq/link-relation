const worker = new Worker('./worker.ts', { type: 'module' });

//Extend EE
const send = message => worker.postMessage({
    message
})

export default {
    worker,
    send
}
