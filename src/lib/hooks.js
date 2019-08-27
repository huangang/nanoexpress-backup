import { codes } from './errors';

const supportedHooks = [
  'onRequest',
  'preParsing',
  'preValidation',
  'preHandler',
  'onResponse',
  'preSend'
];
const { FST_ERR_HOOK_INVALID_TYPE, FST_ERR_HOOK_INVALID_HANDLER } = codes;

function Hooks() {
  this.onRequest = [];
  this.preParsing = [];
  this.preValidation = [];
  this.preHandler = [];
  this.onResponse = [];
  this.preSend = [];
  return this;
}

Hooks.prototype.validate = function(hook, fn) {
  if (typeof hook !== 'string') throw new FST_ERR_HOOK_INVALID_TYPE();
  if (typeof fn !== 'function') throw new FST_ERR_HOOK_INVALID_HANDLER();
  if (supportedHooks.indexOf(hook) === -1) {
    throw new Error(`${hook} hook not supported!`);
  }
};

Hooks.prototype.add = function(hook, fn) {
  this.validate(hook, fn);
  this[hook].push(fn);
};

function buildHooks(h) {
  const hooks = new Hooks();
  hooks.onRequest = h.onRequest.slice();
  hooks.preParsing = h.preParsing.slice();
  hooks.preValidation = h.preValidation.slice();
  hooks.preHandler = h.preHandler.slice();
  hooks.preSend = h.preSend.slice();
  hooks.onResponse = h.onResponse.slice();
  return hooks;
}

function hookRunner(functions, req, res, cb) {
  var i = 0;

  function next(err) {
    if (err || i === functions.length) {
      cb(err, req, res);
      return;
    }

    if (res.sent === true) {
      cb(err, req, res);
      return;
    }
    const result = functions[i++](req, res, next);
    if (result && typeof result.then === 'function') {
      result.then(handleResolve, handleReject);
    }
  }

  function handleResolve() {
    next();
  }

  function handleReject(err) {
    cb(err, req, res);
  }

  next();
}

function preSendHookRunner(functions, req, res, payload, cb) {
  var i = 0;

  function next(err, newPayload) {
    if (err) {
      cb(err, req, res, payload);
      return;
    }

    if (newPayload !== undefined) {
      payload = newPayload;
    }

    if (i === functions.length) {
      cb(null, req, res, payload);
      return;
    }

    const result = functions[i++](req, res, payload, next);
    if (result && typeof result.then === 'function') {
      result.then(handleResolve, handleReject);
    }
  }

  function handleResolve(newPayload) {
    next(null, newPayload);
  }

  function handleReject(err) {
    cb(err, req, res, payload);
  }

  next();
}

function onResponseHookRunner(functions, req, res, cb) {
  var i = 0;

  function next(err) {
    if (err || i === functions.length) {
      cb(err, req, res);
      return;
    }

    const result = functions[i++](req, res, next);
    if (result && typeof result.then === 'function') {
      result.then(handleResolve, handleReject);
    }
  }

  function handleResolve() {
    next();
  }

  function handleReject(err) {
    cb(err, req, res);
  }

  next();
}

export {
  Hooks,
  buildHooks,
  hookRunner,
  preSendHookRunner,
  onResponseHookRunner
};
