import axios, {AxiosPromise} from "axios";
import {DTO} from "../../server/TREE";
import ApiID from './apiID'

export function getSearch(first:string, second:string): AxiosPromise<any[]> {
    return axios.get('http://localhost:3000/titles', {
        params: {
            first,
            second
        }
    });
}

export function getContent(title: string, last: string): AxiosPromise<DTO> {
    return axios.get('http://localhost:3000/content', {
        params: {
            title,
            last,
            id: ApiID.id
        }
    });
}
