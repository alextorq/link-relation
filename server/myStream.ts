import {EventEmitter} from 'events';
import {getPageContent, wikiAnswerContent} from "./API";
import {AxiosPromise} from "axios";

type connectionData = Array<Promise<any>>


export type StreamData = {
    parse: {
        title: string,
        pageid: number,
        text: string;
    }
}

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
            return 10;
        }
        return 1;
    }

    handleRequest(request: AxiosPromise<wikiAnswerContent>, item: string, index: number) {
        request.then(data => {
            this.emit('data', {data, index, item});
            // this.start();
        }).catch((e) => {
            this.emit('error', e);
        }).finally(() => {
            if(this.connection !== null) {
                const indexInArray = this.connection.findIndex(item => item === request)
                this.connection.splice(indexInArray, 1);
                if (!this.connection.length) {
                    this.emit('finish', {index, item});
                }
            }
        });
    }

    private start() {
        const count = this.getCount();
        const start = this.getChunk(count);
        start.forEach((item, index) => {
            this.emit('request_start', item)
            const request = getPageContent(item);
            this.handleRequest(request, item, index);
            (this.connection as connectionData).push(request);
        });
    }

    public destroy() {
        this.abort()
        this.removeAllListeners('data')
        this.removeAllListeners('finish')
        this.removeAllListeners('error')
        this.removeAllListeners('request_start')
        this.emit('destroy')
    }

    public next() {
        this.start()
    }

    private abort() {
        this.list = []

        this.connection = [];
    }

}
