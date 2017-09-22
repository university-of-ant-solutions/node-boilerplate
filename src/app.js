import nconf from 'nconf';
import config from './config';
import { mongo, redis } from './connect';
import setupServer from './setup';

// configurations
config();

// mongo
mongo(null, null, (err) => {
  if (err) {
    nconf.set('status:mongo', false);
  } else {
    nconf.set('status:mongo', true);
  }
});

// redis
redis((err) => {
  if (err) {
    nconf.set('status:redis', false);
  } else {
    nconf.set('status:redis', true);
  }
});

// support heroku deploy
const port = nconf.get('PORT') || nconf.get('http:port');
setupServer(port);
