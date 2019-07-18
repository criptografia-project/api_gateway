import Koa from 'koa';
import KoaRouter from 'koa-router';
import koaLogger from 'koa-logger';
import koaBody from 'koa-bodyparser';
import koaCors from '@koa/cors';

import { graphiqlKoa, graphqlKoa } from 'apollo-server-koa';
import graphQLSchema from './graphQLSchema';

import { formatErr } from './utilities';

const app = new Koa();
const router = new KoaRouter();
const PORT = process.env.PORT || 5000;

const log = require('simple-node-logger').createSimpleFileLogger('project.log');

//const Loggerr = require('loggerr');
//var fs  = require('fs');

//var logfile = fs.createWriteStream('./stdout.log', {
//    flags: 'a',
//    encoding: 'utf8'
//});
 
//const log2 = new Loggerr({
//    streams: Loggerr.levels.map(function() {
//        return logfile;
//    })
//});

app.use(koaLogger());
app.use(koaCors());

// read token from header
app.use(async (ctx, next) => {
	if (ctx.header.authorization) {
		const token = ctx.header.authorization.match(/Bearer ([A-Za-z0-9]+)/);
		if (token && token[1]) {
			ctx.state.token = token[1];
		}
	}
	//log.info('subscription to ', ' accepted at ', new Date().toJSON());
        //log2.info('subscription to ', ' accepted at ', new Date().toJSON());
	//logfile.write("Ecribir esto");
	await next();
});

app.use(async (ctx, next) => {
	log.info('ip 35.247.250.149 action', ctx.header.log, new Date().toJSON());
	//log2.info('subscription to ', ' accepted at ', new Date().toJSON());
	await next();
});

// GraphQL
const graphql = graphqlKoa((ctx) => ({
	schema: graphQLSchema,
	context: { token: ctx.state.token },
	formatError: formatErr
}));
router.post('/graphql', koaBody(), graphql);
router.get('/graphql', graphql);

// test route
router.get('/graphiql', graphiqlKoa({ endpointURL: '/graphql' }));

app.use(router.routes());
app.use(router.allowedMethods());
// eslint-disable-next-line
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
