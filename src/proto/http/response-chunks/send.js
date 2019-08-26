import { onSendHookRunner } from '../../../lib/hooks';

export default function send(result) {
  const { __hooks, __request } = this;
  onSendHookRunner(
    __hooks.preSerialization,
    __request,
    __request.__response,
    result,
    () => {}
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
  onSendHookRunner(
    __hooks.onSend,
    __request,
    __request.__response,
    result,
    () => {}
  );

  return this.end(result);
}
