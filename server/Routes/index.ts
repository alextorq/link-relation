import Router from 'koa-router';
import {searchRequest, getPageContent} from '../API/index'
import {Tree, NodeTree} from '../TREE'
import {MyStream} from "../myStream";


const router = new Router();

router
    .get('/titles', async (ctx) => {
        const {first, second} = ctx.request.query
        const {data} = await searchRequest(first);
        const {data: data2} = await searchRequest(second);
        ctx.body = [data.query.search, data2.query.search];
    })
    .get('/content', async (ctx) => {
        const {title} = ctx.request.query;
        const {data} = await getPageContent(title);
        ctx.body = data;
    }).get('contents', async (ctx) => {
        const {title} = ctx.request.query;
        const {data} = await getPageContent(title);
        ctx.body = data;

        const stream = new MyStream(data.parse.links.map(item => item.title));

        stream.on('data', (data) => {
            console.log(data)
        });
        stream.on('error', (data) => {
            console.log(data)
        });
        stream.on('finish', (data) => {
            console.log(data)
        });

})

export function routes () { return router.routes() }
export function allowedMethods () { return router.allowedMethods() }
