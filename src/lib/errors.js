import { inherits, format } from 'util';
const codes = {};

/**
 * decorate
 */
createError(
  'FST_ERR_DEC_ALREADY_PRESENT',
  'The decorator \'%s\' has already been added!'
);
createError(
  'FST_ERR_DEC_MISSING_DEPENDENCY',
  'The decorator is missing dependency \'%s\'.'
);

/**
 * hooks
 */
createError(
  'FST_ERR_HOOK_INVALID_TYPE',
  'The hook name must be a string',
  500,
  TypeError
);
createError(
  'FST_ERR_HOOK_INVALID_HANDLER',
  'The hook callback must be a function',
  500,
  TypeError
);

function createError(code, message, statusCode = 500, Base = Error) {
  if (!code) throw new Error('Nanoexpress error code must not be empty');
  if (!message) throw new Error('Nanoexpress error message must not be empty');

  code = code.toUpperCase();

  function NanoexpressError(a, b, c) {
    Error.captureStackTrace(this, NanoexpressError);
    this.name = `NanoexpressError [${code}]`;
    this.code = code;

    // more performant than spread (...) operator
    if (a && b && c) {
      this.message = format(message, a, b, c);
    } else if (a && b) {
      this.message = format(message, a, b);
    } else if (a) {
      this.message = format(message, a);
    } else {
      this.message = message;
    }

    this.message = `${this.code}: ${this.message}`;
    this.statusCode = statusCode || undefined;
  }
  NanoexpressError.prototype[Symbol.toStringTag] = 'Error';

  inherits(NanoexpressError, Base);

  codes[code] = NanoexpressError;

  return codes[code];
}

export { codes, createError };
