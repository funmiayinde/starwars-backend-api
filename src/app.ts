import Q from 'q';
import http from 'http';
import express, { Response, Request, NextFunction } from 'express';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import cors from 'cors';
import config from 'config';
import initDatabase from './setup/database';
import loadRoutes from './routing';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));
app.use(cors({}));
app.set('port', config.get('app.port'));

app.use((req: any | Request, res: any | Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method'
    );
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

export default initDatabase()
    .then(() => loadRoutes(app))
    .then(async (app) => {
        const server = await http.createServer(app).listen(config.get('app.port'));
        console.log(`\n
            \tApplication listening on ${config.get('app.base_url')}\n
            \tEnvironment => ${config.util.getEnv('NODE_ENV')}: ${server}\n
            \tDate: ${new Date()}`);
        return Q.resolve(app);
    },
        (err) => {
            console.log('There was an un catch error');
            console.error(err);
        },
    );