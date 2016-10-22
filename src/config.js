import path from 'path';
import nconf from 'nconf';

nconf.env().argv();

const env = nconf.get('NODE_ENV') || 'development';

function relativePath(...p) {
  p.unshift(__dirname);
  return path.join(...p);
}

// function getPath(...p) {
//   p.unshift(__dirname);
//   return path.resolve(...p);
// }

export default function () {
  let f = 'development.json';
  if (env === 'production') {
    f = 'production.json';
  }
  if (env === 'tests') {
    f = 'tests.json';
  }
  nconf.argv().env().file({
    file: relativePath('..', 'config', `${f}`),
  }).defaults({});
  if (env === 'production') {
    nconf.set('db:mongo:uri', nconf.get('MONGO_URL'));
    nconf.set('db:redis:uri', nconf.get('REDIS_URL'));
  }
}
