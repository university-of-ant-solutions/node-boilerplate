import nconf from 'nconf';
import cors from 'cors';
import logger from 'morgan';
import compression from 'compression';
import bodyParser from 'body-parser';
import favicon from 'serve-favicon';
import path from 'path';
import responseTime from 'response-time';
import errorHandler from 'errorhandler';
import express from 'express';

const env = nconf.get('NODE_ENV') || 'development';

export default function setAppDefaults(app) {
  app.use(cors());

  if (env === 'development') {
    app.use(logger('dev'));
  } else {
    app.use(logger('combined'));
  }
  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  // app.use(favicon(path.resolve(__dirname, '../../../public/favicon32.png')));

  // auth
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization,UserId');
    next();
  });

  // will print stacktrace
  if (env === 'development') {
    // Create a middleware that adds a X-Response-Time header to responses.
    app.use(responseTime());

    // Development-only error handler middleware.
    // This middleware is only intended to be used in a development environment,
    // as the full error stack traces and internal details of any object passed to
    // this module will be sent back to the client when an error occurs.
    app.use(errorHandler());
  }

  // hand STATIC REQUEST
  // http://expressjs.com/starter/static-files.html
  function relativePath(p) {
    return path.join(__dirname, p);
  }
  app.use('/public', express.static(path.join(relativePath('../../../public'))));
}
