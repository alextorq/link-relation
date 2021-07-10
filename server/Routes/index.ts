import * as Router from 'koa-router';
import {Commands, getPageContent, searchRequest, wikiAnswerContent} from '../API';
import * as WebSocket from 'ws';
import {MyStream} from '../myStream';
import {v4 as uuidv4} from 'uuid';
import {Tree, NodeTree} from '../TREE/index';
import {parse, URLSearchParams} from 'url';

const router = new Router();
const wss = new WebSocket.Server({port: 3001});

const MAX_LEVEL = 5;

const sockets: {[key: string]: WebSocket} = {};

type context = {
  socket: WebSocket
  finish: string
  tree: Tree
  queue: SendController
  selectNode: NodeTree
  currentLevel: number
  currentNode: NodeTree|null
  stream: MyStream
}

const connections: {[key: string]: context} = {};


function createContext(start: string, finish: string, data: wikiAnswerContent, id: string):context {
  const titles = data.parse.links.map((_) => _.title);
  const tree = new Tree(new NodeTree(data.parse.title));
  tree.addChildren(start, titles);

  return {
    finish,
    tree,
    currentLevel: 0,
    selectNode: tree.getRoot(),
    currentNode: null,
    socket: getWCById(id),
    stream: {} as MyStream,
    queue: {} as SendController,
  };
}


class SendController {
    private time: number;
    private lastTime: number;
    private ws: WebSocket;
    private id: string;
    constructor(ws: WebSocket, id: string) {
      this.time = 5_000;
      this.ws = ws;
      this.lastTime = this.getTime();
      this.id = id;
    }

    getTime() {
      return new Date().getTime();
    }

    sendTree(node: NodeTree) {
      try {
        const currentTime = this.getTime();
        if (currentTime - this.lastTime > this.time) {
          const DTO = node.getDTO(3);
          const messages = {
            command: Commands.S_SEND_TREE,
            data: DTO,
          };
          this.ws.send(JSON.stringify(messages));
          this.lastTime = currentTime;
        }
      } catch (e) {
        console.log(this.ws);
        console.log(e);
      }
    }

    sendFinal() {
      const context = getContentById(this.id);
      const currentTime = this.getTime();
      const DTO = context.tree.getBrunchTop(context.finish);
      const messages = {
        command: Commands.S_FINISH,
        // @ts-ignore
        data: DTO.map((node) => node.getDTO(0)),
      };
      this.ws.send(JSON.stringify(messages));
      this.lastTime = currentTime;
    }
}

function getWCById(id: string) {
  return sockets[id] || null;
}

function getContentById(id: string) {
  return connections[id];
}
function stopTraverse(id: string) {
  const context = getContentById(id);
  const stream = context?.stream;
  if (stream) {
    stream.destroy();
  }
}


function createStream(titles: Array<string>, context: context, idConnection: string) {
  const stream = new MyStream(titles);
  context.queue = new SendController(context.socket, idConnection);
  context.stream = stream;

  stream.on('data', (data) => {
    try {
      data.data.data.parse.text = '';
      context.queue.sendTree(context.selectNode);
      const title = data.data.data.parse.title;

      const titles = data.data.data.parse.links.map((item: {title: string}) => item.title);

      context.tree.addChildren(title, titles);
      const node = context.tree.findBFS(title);
      node?.setTravel();

      if (titles.includes(context.finish)) {
        console.log('find');
        context.queue.sendFinal();
        stream.destroy();
      }
    } catch (e) {
      console.log(e);
    }
    stream.next();
  });
  stream.on('error', (data) => {
    console.error(data);
  });
  stream.on('finish', (data) => {
    context.queue.sendTree(context.selectNode);
    if (!context.currentNode) {
      context.currentNode = context.tree.getRoot();
    } else {
      if (context.currentNode === context.tree.getRoot()) {
        context.currentNode = context.tree.getRoot().getChild()[0];
      } else {
        context.currentNode = context.tree.getNext(context.currentNode.getID());
      }
    }
    if (context.currentNode) {
      // TODO refactoring проверка на сущ и тд
      const findNext = (): void => {
        if (context.currentNode) {
          context.currentLevel = context.tree.getBrunchTop(context.currentNode.getTitle()).length;
          if (context.currentLevel > MAX_LEVEL) {
            console.log('rich max level search');
            // TODO notify user
            return;
          }
          if (!context.currentNode.getNotTravel().length) {
            return findNext();
          }
          createStream(context.currentNode.getNotTravel().map((item) => item.getTitle()), context, idConnection);
        }
      };
      findNext();
    }
  });
  return stream;
}

wss.on('connection', (ws, request) => {
  const parameters = parse(request.url || '');
  const query = new URLSearchParams(parameters.query || '');
  const id = query.get('id') || uuidv4();
  sockets[id] = ws;
  ws.on('close', () => {
    stopTraverse(id);
  });
  ws.on('message', (e) => {
    const context = getContentById(id);
    if (typeof e === 'string') {
      const load = JSON.parse(e);
      const command = load.command;
      const data = load.payload;
      if (command === Commands.C_CHANGE_NODE) {
        const node = context.tree.findBFSID(data.id);
        if (node) {
          context.selectNode = node;
          context.queue.sendTree(context.selectNode);
        }
      }
    }
  });
});


router
    .get('/title', async (ctx) => {
      const {first} = ctx.request.query;
      const {data} = await searchRequest(first);
      ctx.body = data?.query?.search ?? [];
    })
    .get('/content', async (ctx) => {
      try {
        const {title, id, last} = ctx.request.query;
        stopTraverse(id);
        const {data} = await getPageContent(title);
        const context = createContext(title, last, data, id);
        connections[id] = context;
        const titles = data.parse.links.map((_) => _.title);
        createStream(titles, context, id);
        ctx.body = context.tree.getDTO();
      } catch (e) {
        console.error(e);
      }
    });

export function routes() {
  return router.routes();
}
