import {NodeTree, Tree} from '../../server/TREE/index';
import {clientCommands, webSocketCommands, CommandsTypes, ClientCommands} from './Commands';
import {wikiAnswerContent, Commands} from '../../server/API';

let tree = new Tree(new NodeTree(''));

type payload = clientCommands|webSocketCommands
let selectNode: NodeTree|null = null;


function getNodeFromRequest(title?: string, id?: string) {
  let node: NodeTree|null = tree.getRoot();
  if (id) {
    node = tree.findBFSID(id);
  } else if (title) {
    node = tree.findBFS(title);
  }

  return node;
}

function sendTree(node: NodeTree|null) {
  if (node) {
    const dto = node.getDTO(3);
    // @ts-ignore
    postMessage({
      command: ClientCommands.responseTree,
      data: dto,
    });
  }
}


function sendFinishBrunch(path: (NodeTree | null)[]) {
  if (path) {
    // @ts-ignore
    const fin = path.map((node) => node.getDTO(1));
    // @ts-ignore
    postMessage({
      command: ClientCommands.responseFinish,
      data: fin,
    });
  }
}


let finishNode = '';

addEventListener('message', async (event) => {
  const data = event.data.message as payload;

  if (data.commandTypes == CommandsTypes.WEBSOCKET) {
    data.data.forEach((item) => {
      try {
        const title = item.payload.parse.title;
      } catch (e) {
        return;
      }
      if (item.command === Commands.DATA) {
        const payload = item.payload as wikiAnswerContent;
        const title = payload.parse.title;
        const links = payload.parse.links || [];
        if (!title || !links.length) return;
        const titles = links.map((item) => item.title);
        tree.addChildren(title, titles, true);
        if (titles.includes(finishNode)) {
          const path = tree.getBrunchTop(finishNode);
          console.log(path);
          sendFinishBrunch(path);
        }
      }
    });
    sendTree(selectNode);
  }

  if (data.commandTypes === CommandsTypes.CLIENT) {
    const commands = data.commands;
    commands.forEach((command) => {
      if (command.command === ClientCommands.ChangeRoot) {
        const title = command.payload.title;
        tree = new Tree(new NodeTree(title));
      }
      if (command.command === ClientCommands.AddChild) {
        const title = command.payload.title;
        const titles = command.payload.child || [];
        if (!title || !titles.length) return;

        tree.addChildren(title, titles, true);
      }
      if (command.command === ClientCommands.requestTree) {
        selectNode = getNodeFromRequest(command.payload.title, command.payload.id);
        sendTree(selectNode);
      }

      if (command.command === ClientCommands.setFinish) {
        const title = command.payload.title;
        finishNode = title;
      }
    });
  }
});
