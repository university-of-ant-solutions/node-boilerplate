import nconf from 'nconf';
import config from './config';
import { mongo, redis } from './connect';
import setupServer from './setup';

// configurations
config();

// mongo
mongo();

// redis
redis();

// support heroku deploy
const port = nconf.get('PORT') || nconf.get('http:port');
setupServer(port);
