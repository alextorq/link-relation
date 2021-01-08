import axios, {AxiosResponse} from "axios";

export function getSearch(first:string, second:string): Promise<AxiosResponse<Array<Array<any>>>> {
    return axios.get('http://localhost:3000/', {
        params: {
            first,
            second
        }
    });
}
