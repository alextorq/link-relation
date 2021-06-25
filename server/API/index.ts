import axios, {AxiosPromise} from "axios";

type wikiAnswerSearch = {
    query: {
        search: Array<any>
    }
}

export type wikiAnswerContent = {
    parse: {
        title: string,
        pageid: number,
        text: string,
        links: Array<{title: string}>
    }
}

export enum Commands {
    S_FINISH,
    S_SEND_TREE,
    S_ERROR,
    C_CHANGE_NODE,
    S_STOP,
    C_STOP
}

export type webSocketCommand = {
    command: Commands,
    payload: any
}

export function searchRequest(str: string): AxiosPromise<wikiAnswerSearch> {
    return axios.get('https://ru.wikipedia.org/w/api.php', {
        params: {
            action: 'query',
            list: 'search',
            srsearch: str,
            format: 'json'
        }
    })
}


export function getPageContent(str: string): AxiosPromise<wikiAnswerContent> {
    return axios.get('https://ru.wikipedia.org/w/api.php', {
        params: {
            action: 'parse',
            page: str,
            prop: 'text|links',
            format: 'json',
            formatversion:2
        }
    })
}

