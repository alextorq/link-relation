import * as Koa from "koa";
import * as cors from '@koa/cors';
import {routes} from "./server/Routes";

const app = new Koa();


app.use(cors());
app.use(routes());

app.listen(3000);
