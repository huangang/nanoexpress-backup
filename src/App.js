import uWS from 'uWebSockets.js';

import wsHandler from './handler/ws';
import { httpMethods } from './helpers';
import { decorateNanoexpress } from './lib/decorate';
let _prefix = '';
export default class App {
  get config() {
    return this._config;
  }
  get host() {
    const { _config: config } = this;
    return config.host;
  }
  get port() {
    const { _config: config } = this;
    return config.port;
  }
  get address() {
    const { _config: config } = this;
    let address = '';
    if (config.host) {
      address += config.https ? 'https://' : 'http://';
      address += config.host || 'localhost';

      if (config.port) {
        address += ':' + config.port;
      }
    }

    return address;
  }
  constructor(config, app, route) {
    this._config = config;
    this._app = app;
    this._route = route;
    this._hooks = {
      onRequest: [],
      preParsing: [],
      preValidation: [],
      preHandler: [],
      preSerialization: [],
      onSend: [],
      onResponse: []
    };
    this.time = Date.now();

    this._instance = null;

    if (config && config.swagger) {
      this.activateDocs();
    }

    this._routeCalled = false;
    this._optionsCalled = false;
    this.decorate = decorateNanoexpress;
    return this;
  }
  activateDocs() {
    this._app.get('/docs/swagger.json', (res) => {
      res.writeHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(this._config.swagger, null, 4));
    });
  }
  setErrorHandler(fn) {
    this._config._errorHandler = fn;

    return this;
  }
  setNotFoundHandler(fn) {
    this._config._notFoundHandler = fn;

    return this;
  }
  setValidationErrorHandler(fn) {
    this._config._validationErrorHandler = fn;

    return this;
  }
  use(...args) {
    this._route.use(...args);

    return this;
  }
  ws(path, options, wsConfig) {
    this._app.ws(
      path,
      options && options.isRaw
        ? wsConfig
        : wsHandler(path, options, wsConfig, this._config.ajv)
    );

    return this;
  }
  listen(port, host) {
    const { _config: config, _app: app, _routeCalled, _optionsCalled } = this;

    if (!_routeCalled) {
      console.error(
        'nanoexpress [Server]: None of middleware will be called until you define route'
      );
    }

    this.get(
      '/*',
      config._notFoundHandler ||
        ((req, res) => {
          res.statusCode = 404;
          res.send({ code: 404, message: 'The route does not exist' });
        })
    );

    // Polyfill for plugins like CORS
    // Detaching it from every method for performance reason
    if (_routeCalled && !_optionsCalled) {
      this.options('/*', () => {});
    }

    return new Promise((resolve, reject) => {
      if (port === undefined) {
        console.log('[Server]: PORT is required');
        return undefined;
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
          this._instance = token;
          console.log(
            `[Server]: started successfully at [${
              config.host
            }:${port}] in [${Date.now() - this.time}ms]`
          );
          resolve(this);
        } else {
          console.log(`[Server]: failed to host at [${config.host}:${port}]`);
          reject(
            new Error(`[Server]: failed to host at [${config.host}:${port}]`)
          );
          config.host = null;
          config.port = null;
        }
      });
    });
  }
  close() {
    const { _config: config } = this;

    if (this._instance) {
      config.host = null;
      config.port = null;
      uWS.us_listen_socket_close(this._instance);
      this._instance = null;
      console.log('[Server]: stopped successfully');
      return true;
    } else {
      console.log('[Server]: Error, failed while stopping');
      return false;
    }
  }
  register(fn, options = {}) {
    options.prefix ? (_prefix = options.prefix) : (_prefix = '');
    fn(this._app, options, () => {});
  }
  addHook(name, fn) {
    switch (name) {
    case 'onRequest':
    case 'preParsing':
    case 'preValidation':
    case 'preHandler':
    case 'preSerialization':
    case 'onSend':
    case 'onResponse':
      this._hooks[name].push(fn);
      break;
    default:
      break;
    }
    return this;
  }
}

for (let i = 0, len = httpMethods.length; i < len; i++) {
  const method = httpMethods[i];
  App.prototype[method] = function(path, ...fns) {
    _prefix && (path = _prefix + path);
    const { _app, _route, _hooks } = this;

    if (fns.length > 0) {
      const preparedRouteFunction = _route._prepareMethod(
        method,
        path,
        _hooks,
        ...fns
      );

      _app[method](path, preparedRouteFunction);

      this._routeCalled = true;

      if (method === 'options') {
        this._optionsCalled = true;
      }
    }
    return this;
  };
}
