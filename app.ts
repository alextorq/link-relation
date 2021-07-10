import * as Koa from 'koa';
import * as cors from '@koa/cors';
import {routes} from './server/Routes';
const serve = require('koa-static');
const app = new Koa();

app.use(cors());
app.use(routes());
app.use(serve(__dirname + '/public'));

app.listen(3000);
