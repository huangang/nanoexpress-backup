import { http } from '../wrappers';
import { isSimpleHandler } from '../helpers';

const bodyDisallowedMethods = ['get', 'options', 'head', 'trace', 'ws'];
export default (
  path,
  fn,
  config,
  { schema } = {},
  ajv,
  method,
  validationMap
) => {
  const isSimpleRequest = isSimpleHandler(fn);

  if (isSimpleRequest.simple) {
    return isSimpleRequest.handler;
  }
  // For easier aliasing
  const { validation, validationStringify, responseSchema } = validationMap;

  const bodyCall = bodyDisallowedMethods.indexOf(method) === -1;
  const methodUpperCase = method !== 'any' && method.toUpperCase();

  return async (res, req) => {
    // For future usage
    req.rawPath = path;
    req.method = methodUpperCase || req.getMethod();

    const request =
      bodyCall && res.onData
        ? await http.request(req, res, bodyCall, schema)
        : http.request(req, res, false, schema);

    if (validationStringify) {
      let errors;
      for (let i = 0, len = validation.length; i < len; i++) {
        const { type, validator } = validation[i];

        const valid = validator(req[type]);

        if (!valid) {
          if (!errors) {
            errors = {
              type: 'errors',
              errors: [
                { type, messages: validator.errors.map((err) => err.message) }
              ]
            };
          } else {
            errors.errors.push({
              type,
              messages: validator.errors.map((err) => err.message)
            });
          }
        }
      }

      if (errors && !res.aborted) {
        if (config._validationErrorHandler) {
          const validationHandlerResult = config._validationErrorHandler(
            errors,
            req,
            res
          );

          if (validationHandlerResult && validationHandlerResult.errors) {
            errors = validationHandlerResult;
          } else {
            return config._validationErrorHandler(errors, req, res);
          }
        }
        return res.end(validationStringify(errors));
      }
    }
    if (responseSchema) {
      res.schema = responseSchema;
    }

    const response = http.response(res, req, config);

    if (
      !fn.async ||
      fn.simple ||
      fn.asyncToSync ||
      (schema && schema.asyncToSync)
    ) {
      return fn(request, response, config);
    } else if (!bodyCall && !res.abortHandler) {
      // For async function requires onAborted handler
      res.onAborted(() => {
        if (res.stream) {
          res.stream.destroy();
        }
        res.aborted = true;
      });
      res.abortHandler = true;
    }

    if (res.aborted) {
      return undefined;
    }

    const result = await fn(request, response, config);

    if (res.aborted || res.stream) {
      return undefined;
    }

    if (!result || result.error) {
      if (config._errorHandler) {
        return config._errorHandler(result.error, req, res);
      }
      res.writeHeader('Content-Type', 'text/json');
      return res.end(
        `{"error":"${
          result && result.error
            ? result.message
            : 'The route you visited does not returned response'
        }"}`
      );
    } else if (method !== 'options') {
      if (result === null || result === undefined) {
        res.writeHeader('Content-Type', 'text/json');
        return res.end(
          '{"status":"error","message":"Result response is not valid"}'
        );
      } else if (typeof result === 'object') {
        return res.json(result);
      }

      res.end(result);
    }
  };
};
