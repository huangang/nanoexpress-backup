import uWS from 'uWebSockets.js';

import fs from 'fs';
import { resolve } from 'path';
import util from 'util';

import { getMime, sendFile } from './helpers/sifrr-server';

import { http, ws } from './middlewares';
import { routeMapper } from './helpers';
import { decorateNanoexpress } from './lib/decorate';

const readFile = util.promisify(fs.readFile);

let Ajv;

try {
  Ajv = require('ajv');
} catch (e) {
  console.error(
    '[nanoexpress]: `Ajv` was not found in your dependencies list' +
      ', please install yourself for this feature working properly'
  );
}

const nanoexpress = (options = {}) => {
  const time = Date.now(); // For better managing start-time / lags
  let app;
  let ajv;

  if (options.https) {
    app = uWS.SSLApp(options.https);
  } else {
    app = uWS.App();
  }

  const httpMethods = [
    'get',
    'post',
    'put',
    'patch',
    'del',
    'delete',
    'any',
    'head',
    'options',
    'trace'
  ];
  // App configuration
  let middlewares = [];
  const pathMiddlewares = {};
  const config = {
    host: null,
    port: null
  };

  config.https = !!options.https;
  config.configureAjv = options.configureAjv;

  config.setAjv = () => {
    if (typeof Ajv !== 'function') {
      console.error('[nanoexpress]: `Ajv` was not initialized properly');
      return;
    }
    ajv = new Ajv(options.ajv);
    if (options.configureAjv) {
      ajv = options.configureAjv(ajv);
    }
    config.ajv = ajv;
  };

  config.swagger = options.swagger;

  let _prefix = '';
  const _app = {
    config: {
      set: (key, value) => {
        config[key] = value;
      },
      get: (key) => config[key]
    },
    get host() {
      return config.host;
    },
    get port() {
      return config.port;
    },
    get address() {
      let address = '';
      if (config.host) {
        address += config.https ? 'https://' : 'http://';
        address += config.host;
        address += ':' + config.port;
      }

      return address;
    },
    listen: (port, host) =>
      new Promise((resolve, reject) => {
        if (port === undefined) {
          console.log('[Server]: PORT is required');
          return undefined;
        }
        if (middlewares && middlewares.length > 0 && !middlewares.called) {
          _app.any('/*', ...middlewares);
          middlewares.called = true;
        }
        for (const path in pathMiddlewares) {
          const middleware = pathMiddlewares[path];
          if (middleware && middleware.length > 0 && !middleware.called) {
            _app.any(path, ...middleware);
            middleware.called = true;
          }
        }
        port = Number(port);
        app.listen(port, host, (token) => {
          if (typeof host === 'string') {
            config.host = host;
          } else {
            config.host = 'localhost';
          }
          if (typeof port === 'number') {
            config.port = port;
          }

          if (token) {
            _app._instance = token;
            console.log(
              `[Server]: started successfully at [${
                config.host
              }:${port}] in [${Date.now() - time}ms]`
            );
            resolve(_app);
          } else {
            console.log(`[Server]: failed to host at [${config.host}:${port}]`);
            reject(
              new Error(`[Server]: failed to host at [${config.host}:${port}]`)
            );
            config.host = null;
            config.port = null;
          }
        });
      }),
    close: () => {
      if (_app._instance) {
        config.host = null;
        config.port = null;
        uWS.us_listen_socket_close(_app._instance);
        _app._instance = null;
        console.log('[Server]: stopped successfully');
        return true;
      } else {
        console.log('[Server]: Error, failed while stopping');
        return false;
      }
    },
    setErrorHandler: (fn) => {
      config._errorHandler = fn;
      return _app;
    },
    setNotFoundHandler: (fn) => {
      config._notFoundHandler = fn;
      return _app;
    },
    setValidationErrorHandler: (fn) => {
      config._validationErrorHandler = fn;
      return _app;
    },
    register: (fn, options = {}) => {
      options.prefix ? (_prefix = options.prefix) : (_prefix = '');
      fn(_app, options, () => {});
      return _app;
    },
    use: (path, ...fns) => {
      if (typeof path === 'function') {
        fns.unshift(path);
        middlewares.push(...fns);

        // Avoid duplicates if contains for performance
        middlewares = middlewares.filter(
          (item, i, self) => self.indexOf(item) === i
        );
      } else if (typeof path === 'string') {
        if (!pathMiddlewares[path]) {
          pathMiddlewares[path] = [];
        }

        // Avoid duplicates if contains for performance
        pathMiddlewares[path].push(...fns);
        pathMiddlewares[path] = pathMiddlewares[path].filter(
          (item, i, self) => self.indexOf(item) === i
        );
      }
      return _app;
    },
    ws: (path, options, fn) => {
      app.ws(
        path,
        options && options.isRaw
          ? (ws, req) => fn(req, ws)
          : ws(path, options, fn, config, ajv)
      );
      return _app;
    },
    static: function staticRoute(
      route,
      path,
      { index = 'index.html', addPrettyUrl = true, streamConfig } = {}
    ) {
      if (path === undefined) {
        path = route;
        route = '/';
      } else if (!route.endsWith('/')) {
        route += '/';
      }

      const staticFilesPath = fs.readdirSync(path);

      for (const fileName of staticFilesPath) {
        const pathNormalisedFileName = resolve(path, fileName);

        const lstatInfo = fs.lstatSync(pathNormalisedFileName);

        if (lstatInfo && lstatInfo.isDirectory()) {
          staticRoute(route + fileName, pathNormalisedFileName, {
            index,
            addPrettyUrl,
            streamConfig
          });
          continue;
        }

        const isStreamableResource = getMime(fileName);

        const routeNormalised = route + fileName;

        const handler = async (res, req) => {
          if (res.__streaming || res.__called) {
            return;
          }
          if (isStreamableResource) {
            await sendFile(res, req, pathNormalisedFileName, streamConfig);
          } else {
            const sendFile = await readFile(pathNormalisedFileName, 'utf-8');
            res.end(sendFile);
            res.__called = true;
          }
        };
        if (addPrettyUrl && fileName === index) {
          app.get(route, handler);
        }

        app.get(routeNormalised, handler);
      }
      return _app;
    },
    decorate: decorateNanoexpress
  };

  app.delete = app.del;
  httpMethods.forEach((method) => {
    _app[method] = (path, ...fns) => {
      _prefix && (path = _prefix + path);
      let isPrefix;
      let isDirect;
      if (fns.length > 0) {
        const isRaw = fns.find((fn) => fn.isRaw === true);
        isPrefix = fns.find((fn) => fn.isPrefix);
        isDirect = fns.find((fn) => fn.direct);

        if (isRaw) {
          const fn = fns.pop();
          app[method](
            isPrefix ? isPrefix + path : path,
            isDirect ? fn : (res, req) => fn(req, res)
          );
          return _app;
        }
      }
      const pathMiddleware = pathMiddlewares[path];
      if (pathMiddleware && pathMiddleware.length > 0) {
        pathMiddleware.called = true;
      }
      if (middlewares && middlewares.length > 0) {
        middlewares.called = true;
      }
      const handler = http(
        isPrefix ? isPrefix + path : path,
        middlewares.concat(pathMiddleware || []).concat(fns),
        config,
        ajv,
        method,
        _app
      );
      app[method](
        typeof path === 'string' ? path : '/*',
        typeof path === 'function' && !handler ? path : handler
      );
      return _app;
    };
  });

  _app.define = routeMapper(_app);

  return _app;
};

export { nanoexpress as default };
