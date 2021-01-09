import {EventEmitter} from 'events';
import {getContent} from "../src/API";
import {getPageContent, wikiAnswerContent} from "./API";
import {AxiosResponse} from "axios";

type connectionData = Array<Promise<any>>

export class MyStream extends EventEmitter {
    private list: Array<string>;
    private connection: connectionData|null = null;

    constructor(list: Array<string>) {
        super();
        this.list = list;
        this.start();
    }

    getChunk(counter: number): Array<string> {
        return this.list.splice(0, counter);
    }

    getCount():number {
        if (!this.connection) {
            this.connection = [];
            return 50;
        }
        return 1;
    }

    handleRequest(request: Promise<AxiosResponse<wikiAnswerContent>>, item: string, index: number) {
        request.then(data => {
            this.emit('data', {data, index, item});
            if(this.connection !== null) {
                this.connection.splice(index, 1);
                if (this.connection.length === 0) {
                    this.emit('finish', {data, index, item});
                }else {
                    this.start();
                }
            }
        }).catch((e) => {
            this.emit('error', e);
        });
    }

    start() {
        const count = this.getCount();
        const start = this.getChunk(count);
        start.forEach((item, index) => {
            this.emit('request_start', item)
            const request = getPageContent(item);
            (this.connection as connectionData).push(request);
            this.handleRequest(request, item, index);
        });
    }

}
