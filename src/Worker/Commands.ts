import { webSocketCommand} from "../../server/API";

export enum CommandsTypes {
    CLIENT,
    WEBSOCKET
}

export enum ClientCommands {
    ChangeRoot,
    AddChild,
    requestTree,
    responseTree
}

export type clientCommand = {
    command: ClientCommands,
    payload: any
}

export interface webSocketCommands {
    commandTypes: CommandsTypes.WEBSOCKET
    data: webSocketCommand[]
}

export interface clientCommands {
    commandTypes: CommandsTypes.CLIENT
    commands: clientCommand[]
}
