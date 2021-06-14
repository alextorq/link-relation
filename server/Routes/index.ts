import * as Router from 'koa-router';
import {Commands, getPageContent, searchRequest, webSocketCommand} from '../API'
import * as WebSocket from 'ws';
import {MyStream} from "../myStream";
import {v4 as uuidv4} from 'uuid';
import {Tree, NodeTree} from '../TREE/index'
import {parse, URLSearchParams} from 'url';


const router = new Router();
const wss = new WebSocket.Server({ port: 3001 });

let currentLevel = 0
const MAX_LEVEL = 1;
let tree = new Tree(new NodeTree(''))
let selectNode: NodeTree

let finish = '';


// TODO: `edit for multiply users`
let sockets: {[key: string]: MyStream} = {};

const connections: {
    [key: string]: WebSocket
} = {

}



class SendController  {
    private time: number;
    private lastTime: number;
    private ws: WebSocket;
    constructor(ws: WebSocket) {
        this.time = 5_000;
        this.ws = ws;
        this.lastTime = this.getTime()
    }

    getTime() {
        return new Date().getTime()
    }

    sendTree(node: NodeTree) {
        const currentTime = this.getTime();
        if (currentTime - this.lastTime > this.time) {
            const DTO = node.getDTO(3)
            const messages = {
                command: Commands.S_SEND_TREE,
                data: DTO
            }
            this.ws.send(JSON.stringify(messages))
            this.lastTime = currentTime
        }
    }

    sendFinal() {
        const currentTime = this.getTime();
        const DTO = tree.getBrunchTop(finish)
        const messages = {
            command: Commands.S_FINISH,
            // @ts-ignore
            data: DTO.map(node => node.getDTO(0))
        }
        this.ws.send(JSON.stringify(messages))
        this.lastTime = currentTime
    }
}

function allStop() {
    currentLevel = 0
    for (const key in sockets) {
        const stream = sockets[key];
        stream.abort();
    }
    sockets = {};
    currentNode = null
    tree = new Tree(new NodeTree(''))
}

let currentNode:  NodeTree|null = null;

function getWCById(id: string) {
    return connections[id] || null
}
let queue: SendController;

function createStream(ws: WebSocket, titles: Array<string>, skipCheck = false) {
    const stream = new MyStream(titles);
    queue = new SendController(ws);
    const id = uuidv4();
    sockets[id] = stream;

    stream.on('data',  data => {
        try {
            data.data.data.parse.text = ''
        }catch (e){
            return
        }
        queue.sendTree(selectNode)
        const title = data.data.data.parse.title
        try {
            const titles = data.data.data.parse.links.map((item: {title: string}) => item.title);

            tree.addChildren(title, titles)
            const node = tree.findBFS(title)
            node?.setTravel()

            if (titles.includes(finish)) {
                queue.sendFinal();
                stream.abort()
                // @ts-ignore
                console.log('finish')
                stream.removeAllListeners('data')
                stream.removeAllListeners('finish')
            }
        }catch (e) {
            console.log(e)
        }
        stream.next()
    });
    stream.on('error', (data) => {
        console.error(data)
    });
    stream.on('finish', (data) => {
        const rootID = tree.getRoot().getID()
        // item.getChild().length > 0 &&
        queue.sendTree(selectNode);
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
    ws.on('message', (e) => {
        if (typeof e === "string") {
            const load = JSON.parse(e)
            const command = load.command
            const data = load.payload
            if (command === Commands.C_CHANGE_NODE) {
                const node = tree.findBFSID(data.id)
                if (node) {
                    selectNode = node
                    queue.sendTree(selectNode)
                }
            }
        }
    });
    allStop();
    const parameters = parse(request.url || '')
    const query = new URLSearchParams(parameters.query || '')
    const id = query.get('id') || uuidv4()
    connections[id] = ws
    ws.on('close', allStop);
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
            const {title, id, last} = ctx.request.query;
            const {data} = await getPageContent(title);
            finish = last;
            if (data.parse.title && data.parse.links) {
                const titles = data.parse.links.map(_ => _.title)
                tree = new Tree(new NodeTree(data.parse.title))
                tree.addChildren(title, titles)
                createStream(getWCById(id), titles, true)
            }
            ctx.body = tree.getDTO();
            selectNode = tree.getRoot()
        }catch (e) {
            console.error(e)
        }
    })

export function routes () { return router.routes() }
