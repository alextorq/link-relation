import Koa from "koa";
import WebSocket from 'ws';
import cors from '@koa/cors';
import {routes} from "./server/Routes";
import {MyStream} from "./server/myStream";


const wss = new WebSocket.Server({ port: 3001 })

wss.on('connection', (ws) => {
    ws.on('message', (message: string) => {
        const titles = JSON.parse(message)
        const stream = new MyStream(titles);

        stream.on('data', (data) => {
            ws.send(JSON.stringify(data.data.data))
        });
        stream.on('error', (data) => {
            console.error(data)
        });
        stream.on('finish', (data) => {
            // console.log(data)
            ws.send(data)
        });
    })
})


const app = new Koa();


app.use(cors());
app.use(routes());

app.listen(3000);
