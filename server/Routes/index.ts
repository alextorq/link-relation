import Router from 'koa-router';
import {Commands, getPageContent, searchRequest, webSocketCommand} from '../API/index'
import WebSocket from 'ws';
import {MyStream} from "../myStream";
import {v4 as uuidv4} from 'uuid';


const router = new Router();
const wss = new WebSocket.Server({ port: 3001 });


// TODO: `edit for multiply users`
let sockets: {[key: string]: MyStream} = {};


function allStop() {
    for (const key in sockets) {
        const stream = sockets[key];
        stream.abort();
    }
    sockets = {};
}

function createStream(ws: WebSocket, titles: Array<string>) {
    const stream = new MyStream(titles);
    const id = uuidv4();
    sockets[id] = stream;

    stream.on('data', (data) => {
        try {
            data.data.data.parse.text = ''
        }catch (e){}
        const messageCommand: webSocketCommand = {
            command: Commands.DATA,
            payload: data.data.data
        }
        ws.send(JSON.stringify(messageCommand))
    });
    // stream.on('error', (data) => {
    //     // console.error(data)
    // });
    stream.on('finish', (data) => {
        const messageCommand: webSocketCommand = {
            command: Commands.FINISH,
            payload: data
        }
        console.log('finish')
        ws.send(JSON.stringify(messageCommand));
    });
}

wss.on('connection', (ws) => {
    ws.on('message', (message: string) => {
        const request =  JSON.parse(message) as webSocketCommand;
        if (request.command === Commands.REQUEST_DATA) {
            createStream(ws, request.payload as Array<string>)
        }
    });
    ws.on('close', function close() {
        allStop();
    });
})


router
    .get('/titles', async (ctx) => {
        allStop();
        const {first, second} = ctx.request.query
        const {data} = await searchRequest(first);
        const {data: data2} = await searchRequest(second);
        ctx.body = [data.query.search, data2.query.search];
    })
    .get('/content', async (ctx) => {
        allStop();
        const {title} = ctx.request.query;
        const {data} = await getPageContent(title);
        ctx.body = data;
    })

export function routes () { return router.routes() }
export function allowedMethods () { return router.allowedMethods() }
