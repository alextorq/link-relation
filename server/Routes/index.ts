import Router from 'koa-router';
import {searchRequest, getPageContent} from '../API/index'
import {Tree, NodeTree} from '../TREE/INDEX'


const router = new Router();

router
    .get('/titles', async (ctx) => {
        const {first, second} = ctx.request.query
        const {data} = await searchRequest(first);
        const {data: data2} = await searchRequest(second);
        ctx.body = [data.query.search, data2.query.search];
    })
    .get('/content/', async (ctx) => {
        const {content1, content2} = ctx.request.query;

        const tree = new Tree(new NodeTree(content1));
        const node = tree.findBFF((item) => item.getTitle() === content1);

        const {data} = await getPageContent(content1);

        const titles = data.parse.links.map(item => item.title)
        node?.addRowChild(...titles);

        const status = tree.findBFF((item) => item.getTitle() === content2)

        console.log(status)

        ctx.body = data;
    })

export function routes () { return router.routes() }
export function allowedMethods () { return router.allowedMethods() }
