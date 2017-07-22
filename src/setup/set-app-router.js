import nconf from 'nconf';
import logger from '../logger';
import { TodosModel } from '../models';
import { toObjectId, isObjectId } from '../utils/to-objectid';
const env = nconf.get('NODE_ENV') || 'development';

export default function setAppRouter(app) {
  // api
  const VERSIONS = { 'Version 0': 'v0', 'Version 1': 'v1' };

  app.get('/', (req, res) => {
    res.send('Hello world 23\n');
  });

  app.get('/api', function (req, res) {
    res.json(VERSIONS);
  });

  const wait = (num) => {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, num);
    });
  };

  app.get('/todos', async (req, res) => {
    // await wait(5000);
    const t = TodosModel();
    return res.json(await(t.find({}).sort({
      updatedAt: -1
    })));
  });

  app.post('/todos', async (req, res) => {
    // await wait(3000);
    const { title } = req.body;
    const data = await TodosModel().create({
      title,
      done: false
    });
    return res.json({
      data,
      meta: {}
    });
  });

  app.delete('/todos/:id', async (req, res) => {
    // await wait(3000);
    let { id } = req.params;
    if(typeof id === 'string') {
      id = toObjectId(id);
    }
    const i = await TodosModel().remove({ _id: id });
    if(i && i.result && i.result.ok === 1) {
      return res.json({
        success: true
      });
    }
    return res.json({
      success: false
    });
  });

  app.put('/todos/:id', async (req, res) => {
    // await wait(3000);
    console.log(1234);
  });

  // log errors
  function logErrors(err, req, res, next) {
    logger.error(err.message);
    next(err);
  }
  app.use(logErrors);

  /**
   * Where apiErrorHandler is defined as the following
   * (note that the error is explicitly passed along to the next):
   */
  function apiErrorHandler(err, req, res, next) {
    logger.crit('apiErrorHandler not implement yet');
    next(err);
  }
  app.use(apiErrorHandler);

  // error handling
  function webappErrorHandler(err, req, res, next) {
    logger.crit('webappErrorHandler not implement yet');
    next(err);
  }
  app.use(webappErrorHandler);

  // not found handling
  app.use(function handleNotFound(req, res, next) {
    res
    .status(400)
    .send('bad request');
  });
}
