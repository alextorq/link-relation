import axios, {AxiosPromise} from "axios";
import {wikiAnswerContent} from '../../server/API'

export function getSearch(first:string, second:string): AxiosPromise<any[]> {
    return axios.get('http://localhost:3000/titles', {
        params: {
            first,
            second
        }
    });
}


export function getContent(title: string): AxiosPromise<wikiAnswerContent> {
    return axios.get('http://localhost:3000/content', {
        params: {
            title,
        }
    });
}
