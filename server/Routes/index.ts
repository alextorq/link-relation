import * as Router from 'koa-router';
import {Commands, getPageContent, searchRequest, webSocketCommand} from '../API/index'
import * as WebSocket from 'ws';
import {MyStream} from "../myStream";
import {v4 as uuidv4} from 'uuid';
import {Tree, NodeTree, Index} from '../TREE/index'
import {parse, URLSearchParams} from 'url';


const router = new Router();
const wss = new WebSocket.Server({ port: 3001 });

let currentLevel = 0
const MAX_LEVEL = 1;
let tree = new Tree(new NodeTree(''))


// TODO: `edit for multiply users`
let sockets: {[key: string]: MyStream} = {};

const connections: {
    [key: string]: WebSocket
} = {

}


const request = new Index()


class Queue  {
    private time: number;
    private lastTime: number;
    private buffer: any[];
    private ws: WebSocket;
    constructor(ws: WebSocket) {
        this.buffer = [];
        this.time = 1000;
        this.ws = ws;
        this.lastTime = this.getTime()
    }

    getTime() {
        return new Date().getTime()
    }

    add(item: any) {
        this.buffer.push(item)
        this.send()
    }

    send() {
        const currentTime = this.getTime();
        if (currentTime - this.lastTime > this.time) {
            const messages = JSON.stringify(this.buffer)
            this.ws.send(messages)
            this.lastTime = currentTime
            this.buffer = []
        }
    }
}

function allStop() {
    currentLevel = 0
    for (const key in sockets) {
        const stream = sockets[key];
        stream.abort();
    }
    sockets = {};
}

let currentNode:  NodeTree|null = null;

function getWCById(id: string) {
    return connections[id] || null
}

function createStream(ws: WebSocket, titles: Array<string>, skipCheck = false) {
    const stream = new MyStream(titles);
    const queue = new Queue(ws);
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
        queue.add(messageCommand)
        const title = messageCommand.payload.parse.title
        try {
            const titles = data.data.data.parse.links.map((item: {title: string}) => item.title);
            tree.addChildren(item => item.getTitle() === title, titles)
            const node = tree.findBFS(item => item.getTitle() === title)
            node?.setTravel()
        }catch (e) {
            console.log(e)
        }
    });
    stream.on('error', (data) => {
        console.error(data)
    });
    stream.on('finish', (data) => {
        const rootID = tree.getRoot().getID()
        // item.getChild().length > 0 &&
        queue.send();
        if (!currentNode) {
            currentNode = tree.getRoot()
        }else {
            if (currentNode === tree.getRoot()) {
                currentNode = tree.getRoot().getChild()[0]
            }else {
                currentNode = tree.getNext(currentNode.getID());
            }
        }
        if (currentNode) {
            createStream(ws, currentNode.getNotTravel().map(item => item.getTitle()));
        }
    });
}

wss.on('connection', (ws, request) => {
    const parameters = parse(request.url || '')
    const query = new URLSearchParams(parameters.query || '')
    const id = query.get('id') || uuidv4()
    connections[id] = ws
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
        try {
            allStop();
            const {title, id} = ctx.request.query;
            const {data} = await getPageContent(title);
            if (data.parse.title && data.parse.links) {
                const titles = data.parse.links.map(_ => _.title)
                tree = new Tree(new NodeTree(data.parse.title))
                tree.addChildren(node => node.getTitle() === data.parse.title, titles)
                createStream(getWCById(id), titles, true)
            }
            ctx.body = tree.getDTO();
        }catch (e) {
            console.error(e)
        }
    })

export function routes () { return router.routes() }
// export function allowedMethods () { return router.allowedMethods() }
