import axios, {AxiosResponse} from "axios";
import {wikiAnswerContent} from '../../server/API'

export function getSearch(first:string, second:string): Promise<AxiosResponse<any[]>> {
    return axios.get('http://localhost:3000/titles', {
        params: {
            first,
            second
        }
    });
}


export function getContent(title: string): Promise<AxiosResponse<wikiAnswerContent>> {
    return axios.get('http://localhost:3000/content', {
        params: {
            title,
        }
    });
}
