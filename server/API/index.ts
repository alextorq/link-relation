import axios, {AxiosResponse} from "axios";

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
    FINISH,
    DATA,
    ERROR,
    REQUEST_DATA,
}

export type webSocketCommand = {
    command: Commands,
    payload: Object|Array<any>
}

export function searchRequest(str: string): Promise<AxiosResponse<wikiAnswerSearch>> {
    return axios.get('https://ru.wikipedia.org/w/api.php', {
        params: {
            action: 'query',
            list: 'search',
            srsearch: str,
            format: 'json'
        }
    })
}


export function getPageContent(str: string): Promise<AxiosResponse<wikiAnswerContent>> {
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

