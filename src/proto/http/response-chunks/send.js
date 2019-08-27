import { preSendHookRunner, onResponseHookRunner } from '../../../lib/hooks';

export default function send(result) {
  const { __hooks, __request } = this;
  const { __response } = __request;
  preSendHookRunner(
    __hooks['preSend'].concat(
      (__hooks[__request.url] && __hooks[__request.url]['preSend']) || []
    ),
    __request,
    __response,
    result,
    (err, req, res, payload) => {
      if (this.sent === true) {
        return;
      }
      if (err != null) {
        res.status(500);
        result = { error: err.message };
        return;
      } else {
        result = payload;
      }
    }
  );

  if (!result) {
    result = '';
  } else if (typeof result === 'object') {
    this.setHeader('Content-Type', 'application/json');

    const { fastJson } = this;

    if (fastJson) {
      const fastJsonWithCode = fastJson[this.rawStatusCode];

      if (fastJsonWithCode) {
        result = fastJsonWithCode(result);
      } else {
        result = fastJson(result);
      }
    } else {
      result = JSON.stringify(result);
    }
  }

  this.sent = true;
  const endResult = this.end(result);

  onResponseHookRunner(
    __hooks['onResponse'].concat(
      (__hooks[__request.url] && __hooks[__request.url]['onResponse']) || []
    ),
    __request,
    __response,
    (err) => {
      if (err != null) {
        return;
      }
    }
  );
  return endResult;
}
