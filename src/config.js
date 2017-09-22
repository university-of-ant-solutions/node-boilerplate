import path from 'path';
import os from 'os';
import nconf from 'nconf';

nconf.env().argv();

const env = nconf.get('NODE_ENV') || 'development';

function relativePath(...p) {
  p.unshift(__dirname);
  return path.join(...p);
}

export default function () {
  const f = 'index.json';
  nconf.argv().env().file({
    file: relativePath('..', 'config', `${f}`),
  }).defaults({});

  if (nconf.get('MONGO_URL')) {
    nconf.set('db:mongo:uri', nconf.get('MONGO_URL'));
  }

  if (nconf.get('REDIS_URL')) {
    nconf.set('db:redis:uri', nconf.get('REDIS_URL'));
  }

  nconf.set('status:hostname', os.hostname());
}
