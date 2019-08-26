'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var cookie = _interopDefault(require('cookie'));
var querystring = require('querystring');
var stream = require('stream');
var fs = _interopDefault(require('fs'));
var zlib = _interopDefault(require('zlib'));
var util = require('util');
var util__default = _interopDefault(util);
var http = _interopDefault(require('http'));
var fastJson = _interopDefault(require('fast-json-stringify'));

var headers = (req, schema) => {
  let headers;
  if (schema) {
    const { properties } = schema;
    for (const property in properties) {
      if (!headers) {
        headers = {};
      }
      headers[property] = req.getHeader(property);
    }
    return headers;
  } else if (schema !== false) {
    req.forEach((key, value) => {
      if (!headers) {
        headers = {};
      }
      headers[key] = value;
    });
  }
  return headers;
};

var cookies = (req, schema) => {
  let cookies;
  const { headers } = req;
  const headerCookie =
    (headers && headers.cookie) || (req && req.getHeader('Cookie'));

  if (headerCookie) {
    if (cookies) {
      const parsedCookie = cookie.parse(headerCookie);
      if (schema) {
        const { properties } = schema;
        for (const cookie in properties) {
          cookies[cookie] = parsedCookie[cookie];
        }
      } else {
        for (const cookie in parsedCookie) {
          cookies[cookie] = parsedCookie[cookie];
        }
      }
    } else if (!cookies) {
      cookies = cookie.parse(headerCookie);
    }
  }
  return cookies;
};

var queries = (req) => {
  const query = req.getQuery();

  let queries;
  if (!query) {
    return queries;
  }
  const parsed = querystring.parse(query);

  for (const query in parsed) {
    // On-Demand attaching for memory reason
    if (!queries) {
      queries = {};
    }

    queries[query] = parsed[query];
  }
  return queries;
};

var body = async (req, res) => {
  const stream$1 = new stream.Readable();
  stream$1._read = () => true;
  req.pipe = stream$1.pipe.bind(stream$1);
  req.stream = stream$1;

  if (!res || !res.onData) {
    return undefined;
  }

  let isAborted = false;
  let body = await new Promise((resolve) => {
    /* Register error cb */
    res.onAborted(() => {
      if (res.stream) {
        res.stream.destroy();
      }
      isAborted = true;
      resolve();
    });

    let buffer;
    res.onData((chunkPart, isLast) => {
      if (isAborted) {
        return;
      }
      const chunk = Buffer.from(chunkPart);
      stream$1.push(
        new Uint8Array(
          chunkPart.slice(chunkPart.byteOffset, chunkPart.byteLength)
        )
      );
      if (isLast) {
        stream$1.push(null);
        if (buffer) {
          resolve(Buffer.concat([buffer, chunk]).toString('utf8'));
        } else {
          resolve(chunk.toString('utf8'));
        }
      } else {
        if (buffer) {
          buffer = Buffer.concat([buffer, chunk]);
        } else {
          buffer = Buffer.concat([chunk]);
        }
      }
    });
  });

  if (!body) {
    return undefined;
  }

  const { headers } = req;

  if (headers) {
    const contentType = headers['content-type'];
    if (contentType) {
      if (contentType.indexOf('/json') !== -1) {
        body = JSON.parse(body);
      } else if (contentType.indexOf('/x-www-form-urlencoded') !== -1) {
        body = querystring.parse(req.body);
      }
    }
  }

  return body;
};

const PARAMS_REGEX = /:([A-Za-z0-9_-]+)/g;

var params = (req) => {
  const { rawPath } = req;

  let params;
  if (rawPath.indexOf(':') !== -1) {
    const paramsMatch = rawPath.match(PARAMS_REGEX);

    if (paramsMatch) {
      if (!params) {
        params = {};
      }
      for (let i = 0, len = paramsMatch.length; i < len; i++) {
        const name = paramsMatch[i];
        params[name.substr(1)] = req.getParameter(i);
      }
    }
  }

  return params;
};

const mimes = {
  '3gp': 'video/3gpp',
  a: 'application/octet-stream',
  ai: 'application/postscript',
  aif: 'audio/x-aiff',
  aiff: 'audio/x-aiff',
  asc: 'application/pgp-signature',
  asf: 'video/x-ms-asf',
  asm: 'text/x-asm',
  asx: 'video/x-ms-asf',
  atom: 'application/atom+xml',
  au: 'audio/basic',
  avi: 'video/x-msvideo',
  bat: 'application/x-msdownload',
  bin: 'application/octet-stream',
  bmp: 'image/bmp',
  bz2: 'application/x-bzip2',
  c: 'text/x-c',
  cab: 'application/vnd.ms-cab-compressed',
  cc: 'text/x-c',
  chm: 'application/vnd.ms-htmlhelp',
  class: 'application/octet-stream',
  com: 'application/x-msdownload',
  conf: 'text/plain',
  cpp: 'text/x-c',
  crt: 'application/x-x509-ca-cert',
  css: 'text/css',
  csv: 'text/csv',
  cxx: 'text/x-c',
  deb: 'application/x-debian-package',
  der: 'application/x-x509-ca-cert',
  diff: 'text/x-diff',
  djv: 'image/vnd.djvu',
  djvu: 'image/vnd.djvu',
  dll: 'application/x-msdownload',
  dmg: 'application/octet-stream',
  doc: 'application/msword',
  dot: 'application/msword',
  dtd: 'application/xml-dtd',
  dvi: 'application/x-dvi',
  ear: 'application/java-archive',
  eml: 'message/rfc822',
  eps: 'application/postscript',
  exe: 'application/x-msdownload',
  f: 'text/x-fortran',
  f77: 'text/x-fortran',
  f90: 'text/x-fortran',
  flv: 'video/x-flv',
  for: 'text/x-fortran',
  gem: 'application/octet-stream',
  gemspec: 'text/x-script.ruby',
  gif: 'image/gif',
  gz: 'application/x-gzip',
  h: 'text/x-c',
  hh: 'text/x-c',
  htm: 'text/html',
  html: 'text/html',
  ico: 'image/vnd.microsoft.icon',
  ics: 'text/calendar',
  ifb: 'text/calendar',
  iso: 'application/octet-stream',
  jar: 'application/java-archive',
  java: 'text/x-java-source',
  jnlp: 'application/x-java-jnlp-file',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  js: 'application/javascript',
  json: 'application/json',
  log: 'text/plain',
  m3u: 'audio/x-mpegurl',
  m4v: 'video/mp4',
  man: 'text/troff',
  mathml: 'application/mathml+xml',
  mbox: 'application/mbox',
  mdoc: 'text/troff',
  me: 'text/troff',
  mid: 'audio/midi',
  midi: 'audio/midi',
  mime: 'message/rfc822',
  mjs: 'application/javascript',
  mml: 'application/mathml+xml',
  mng: 'video/x-mng',
  mov: 'video/quicktime',
  mp3: 'audio/mpeg',
  mp4: 'video/mp4',
  mp4v: 'video/mp4',
  mpeg: 'video/mpeg',
  mpg: 'video/mpeg',
  ms: 'text/troff',
  msi: 'application/x-msdownload',
  odp: 'application/vnd.oasis.opendocument.presentation',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  odt: 'application/vnd.oasis.opendocument.text',
  ogg: 'application/ogg',
  p: 'text/x-pascal',
  pas: 'text/x-pascal',
  pbm: 'image/x-portable-bitmap',
  pdf: 'application/pdf',
  pem: 'application/x-x509-ca-cert',
  pgm: 'image/x-portable-graymap',
  pgp: 'application/pgp-encrypted',
  pkg: 'application/octet-stream',
  pl: 'text/x-script.perl',
  pm: 'text/x-script.perl-module',
  png: 'image/png',
  pnm: 'image/x-portable-anymap',
  ppm: 'image/x-portable-pixmap',
  pps: 'application/vnd.ms-powerpoint',
  ppt: 'application/vnd.ms-powerpoint',
  ps: 'application/postscript',
  psd: 'image/vnd.adobe.photoshop',
  py: 'text/x-script.python',
  qt: 'video/quicktime',
  ra: 'audio/x-pn-realaudio',
  rake: 'text/x-script.ruby',
  ram: 'audio/x-pn-realaudio',
  rar: 'application/x-rar-compressed',
  rb: 'text/x-script.ruby',
  rdf: 'application/rdf+xml',
  roff: 'text/troff',
  rpm: 'application/x-redhat-package-manager',
  rss: 'application/rss+xml',
  rtf: 'application/rtf',
  ru: 'text/x-script.ruby',
  s: 'text/x-asm',
  sgm: 'text/sgml',
  sgml: 'text/sgml',
  sh: 'application/x-sh',
  sig: 'application/pgp-signature',
  snd: 'audio/basic',
  so: 'application/octet-stream',
  svg: 'image/svg+xml',
  svgz: 'image/svg+xml',
  swf: 'application/x-shockwave-flash',
  t: 'text/troff',
  tar: 'application/x-tar',
  tbz: 'application/x-bzip-compressed-tar',
  tcl: 'application/x-tcl',
  tex: 'application/x-tex',
  texi: 'application/x-texinfo',
  texinfo: 'application/x-texinfo',
  text: 'text/plain',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  torrent: 'application/x-bittorrent',
  tr: 'text/troff',
  txt: 'text/plain',
  vcf: 'text/x-vcard',
  vcs: 'text/x-vcalendar',
  vrml: 'model/vrml',
  war: 'application/java-archive',
  wav: 'audio/x-wav',
  wma: 'audio/x-ms-wma',
  wmv: 'video/x-ms-wmv',
  wmx: 'video/x-ms-wmx',
  wrl: 'model/vrml',
  wsdl: 'application/wsdl+xml',
  xbm: 'image/x-xbitmap',
  xhtml: 'application/xhtml+xml',
  xls: 'application/vnd.ms-excel',
  xml: 'application/xml',
  xpm: 'image/x-xpixmap',
  xsl: 'application/xml',
  xslt: 'application/xslt+xml',
  yaml: 'text/yaml',
  yml: 'text/yaml',
  zip: 'application/zip',
  default: 'text/html'
};

const getMime = (path) => {
  const i = path.lastIndexOf('.');
  return mimes[path.substr(i + 1).toLowerCase()];
};

function stob(stream) {
  return new Promise((resolve) => {
    const buffers = [];
    stream.on('data', buffers.push.bind(buffers));

    stream.on('end', () => {
      const buffLen = buffers.length;

      if (buffLen === 0) {
        resolve(Buffer.allocUnsafe(0));
      } else if (buffLen === 1) {
        resolve(buffers[0]);
      } else {
        resolve(Buffer.concat(buffers));
      }
    });
  });
}

const fsStat = util__default.promisify(fs.stat);

const compressions = {
  br: zlib.createBrotliCompress,
  gzip: zlib.createGzip,
  deflate: zlib.createDeflate
};
const bytes = 'bytes=';

async function sendFile(
  path,
  {
    lastModified = true,
    compress = false,
    compressionOptions = {
      priority: ['br', 'gzip', 'deflate']
    },
    cache = false
  } = {}
) {
  let isAborted = false;
  this.onAborted(() => {
    if (this.stream) {
      this.stream.destroy();
    }
    isAborted = true;
  });

  const res = this;
  const stat = await fsStat(path);
  const { mtime } = stat;
  let { size } = stat;

  if (isAborted) {
    return;
  }

  mtime.setMilliseconds(0);
  const mtimeutc = mtime.toUTCString();

  const { headers = {} } = res.__request;

  // handling last modified
  if (lastModified) {
    // Return 304 if last-modified
    if (headers['if-modified-since']) {
      if (new Date(headers['if-modified-since']) >= mtime) {
        res.writeStatus('304 Not Modified');
        return res.end();
      }
    }
    headers['last-modified'] = mtimeutc;
  }
  headers['content-type'] = getMime(path);

  // write data
  let start = 0,
    end = size - 1;

  if (headers.range) {
    compress = false;
    const parts = headers.range.replace(bytes, '').split('-');
    start = parseInt(parts[0], 10);
    end = parts[1] ? parseInt(parts[1], 10) : end;
    headers['accept-ranges'] = 'bytes';
    headers['content-range'] = `bytes ${start}-${end}/${size}`;
    size = end - start + 1;
    res.writeStatus('206 Partial Content');
  }

  // for size = 0
  if (end < 0) {
    end = 0;
  }

  let readStream = fs.createReadStream(path, { start, end });
  this.stream = readStream;
  // Compression;
  let compressed = false;
  if (compress) {
    const l = compressionOptions.priority.length;
    for (let i = 0; i < l; i++) {
      const type = compressionOptions.priority[i];
      if (headers['accept-encoding'].indexOf(type) > -1) {
        compressed = true;
        const compressor = compressions[type](compressionOptions);
        readStream.pipe(compressor);
        readStream = compressor;
        headers['content-encoding'] = compressionOptions.priority[i];
        break;
      }
    }
  }

  res.writeHeaders(headers);
  // check cache
  if (cache && !compressed) {
    return cache.wrap(
      `${path}_${mtimeutc}_${start}_${end}`,
      (cb) => {
        stob(readStream)
          .then((b) => cb(null, b.toString('utf-8')))
          .catch(cb);
      },
      { ttl: 0 },
      (err, string) => {
        if (err) {
          res.writeStatus('500 Internal server error');
          res.end();
          throw err;
        }
        if (isAborted) {
          readStream.destroy();
          return;
        }
        res.end(string);
      }
    );
  } else if (compressed) {
    readStream.on('data', (buffer) => {
      res.write(
        buffer.buffer.slice(
          buffer.byteOffset,
          buffer.byteOffset + buffer.byteLength
        )
      );
    });
  } else {
    readStream.on('data', (buffer) => {
      if (isAborted) {
        readStream.destroy();
        return;
      }
      const chunk = buffer.buffer.slice(
          buffer.byteOffset,
          buffer.byteOffset + buffer.byteLength
        ),
        lastOffset = res.getWriteOffset();

      // First try
      const [ok, done] = res.tryEnd(chunk, size);

      if (done) {
        readStream.destroy();
      } else if (!ok) {
        // pause because backpressure
        readStream.pause();

        // Save unsent chunk for later
        res.ab = chunk;
        res.abOffset = lastOffset;

        // Register async handlers for drainage
        res.onWritable((offset) => {
          const [ok, done] = res.tryEnd(
            res.ab.slice(offset - res.abOffset),
            size
          );
          if (done) {
            readStream.destroy();
          } else if (ok) {
            readStream.resume();
          }
          return ok;
        });
      }
    });
  }
  readStream
    .on('error', () => {
      if (!isAborted) {
        res.writeStatus('500 Internal server error');
        res.end();
      }
      readStream.destroy();
    })
    .on('end', () => {
      if (!isAborted) {
        res.end();
      }
    });
}

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
      this.message = util.format(message, a, b, c);
    } else if (a && b) {
      this.message = util.format(message, a, b);
    } else if (a) {
      this.message = util.format(message, a);
    } else {
      this.message = message;
    }

    this.message = `${this.code}: ${this.message}`;
    this.statusCode = statusCode || undefined;
  }
  NanoexpressError.prototype[Symbol.toStringTag] = 'Error';

  util.inherits(NanoexpressError, Base);

  codes[code] = NanoexpressError;

  return codes[code];
}

function hookRunner(functions, runner, req, res, cb) {
  var i = 0;

  function next(err) {
    if (err || i === functions.length) {
      cb(err, req, res);
      return;
    }

    const result = runner(functions[i++], req, res, next);
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

function onSendHookRunner(functions, req, res, payload, cb) {
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

function hookIterator(fn, req, res, next) {
  if (res.sent === true) return undefined;
  return fn(req, res, next);
}

function modifyEnd() {
  if (!this._modifiedEnd) {
    const _oldEnd = this.end;

    this.end = function(chunk, encoding) {
      // eslint-disable-next-line prefer-const
      let { _headers, statusCode } = this;
      const { rawStatusCode } = this;

      // Polyfill for express-session and on-headers module
      if (!this.writeHead.notModified) {
        this.writeHead(statusCode || rawStatusCode, _headers);
        this.writeHead.notModified = true;
        _headers = this._headers;
      }

      if (typeof statusCode === 'number' && statusCode !== rawStatusCode) {
        this.status(statusCode);
        statusCode = this.statusCode;
      }
      if (_headers) {
        if (statusCode && statusCode !== rawStatusCode) {
          this.writeStatus(statusCode);
        }

        this.applyHeadersAndStatus();
      } else if (statusCode && statusCode !== rawStatusCode) {
        this.writeStatus(statusCode);
      }
      const { __hooks, __request } = this;

      hookRunner(
        __hooks.onResponse,
        hookIterator,
        __request.request,
        __request.__response,
        () => {}
      );
      return encoding
        ? _oldEnd.call(this, chunk, encoding)
        : _oldEnd.call(this, chunk);
    };

    this._modifiedEnd = true;
  }
  return this;
}

function send(result) {
  const { __hooks, __request } = this;
  const preSerializations = __hooks.preSerialization.concat(
    (__hooks[__request.url] && __hooks[__request.url].preSerialization) || []
  );
  onSendHookRunner(
    preSerializations,
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

function type(type) {
  this.setHeader('Content-Type', type);

  return this;
}



var HttpResponseChunks = /*#__PURE__*/Object.freeze({
  modifyEnd: modifyEnd,
  send: send,
  type: type
});

function setCookie(name, value, options) {
  if (options.expires && Number.isInteger(options.expires)) {
    options.expires = new Date(options.expires);
  }
  const serialized = cookie.serialize(name, value, options);

  let setCookie = this.getHeader('Set-Cookie');

  if (!setCookie) {
    this.setHeader('Set-Cookie', serialized);
    return undefined;
  }

  if (typeof setCookie === 'string') {
    setCookie = [setCookie];
  }

  setCookie.push(serialized);

  this.removeHeader('Set-Cookie');
  this.setHeader('Set-Cookie', setCookie);
  return this;
}

function hasCookie(name) {
  const req = this.__request;
  return !!req && !!req.cookies && req.cookies[name] !== undefined;
}

function removeCookie(name, options = {}) {
  const currTime = Date.now();
  if (!options.expires || options.expires >= currTime) {
    options.expires = currTime - 1000;
  }
  this.setCookie(name, '', options);
  return this;
}



var HttpCookieResponseChunks = /*#__PURE__*/Object.freeze({
  setCookie: setCookie,
  hasCookie: hasCookie,
  removeCookie: removeCookie
});

const HttpCookieResponse = {
  ...HttpCookieResponseChunks
};

// Alias for Express users
HttpCookieResponse.cookie = HttpCookieResponse.setCookie;

function setHeader(key, value) {
  !this._modifiedEnd && this.modifyEnd();

  if (!this._headers) {
    this._headers = {};
  }
  this._headers[key] = value;
  return this;
}

function getHeader(key) {
  return !!this._headers && !!key && this._headers[key];
}

function hasHeader(key) {
  return (
    !!this._headers &&
    this._headers[key] !== undefined &&
    this._headers[key] !== null
  );
}

function removeHeader(key) {
  if (!this._headers || !this._headers[key]) {
    return undefined;
  }
  !this._modifiedEnd && this.modifyEnd();
  this._headers[key] = null;
  delete this._headers[key];

  return this;
}

function setHeaders(headers) {
  for (const header in headers) {
    if (this._headers) {
      const currentHeader = this._headers[header];
      if (currentHeader !== undefined || currentHeader !== null) {
        continue;
      }
    }
    this.setHeader(header, headers[header]);
  }

  return this;
}

function writeHeaderValues(header, values) {
  for (let i = 0, len = values.length; i < len; i++) {
    this.writeHeader(header, values[i]);
  }
}

function writeHeaders(headers) {
  for (const header in headers) {
    const value = headers[header];
    if (value) {
      if (value.splice) {
        this.writeHeaderValues(header, value);
      } else {
        this.writeHeader(header, value);
      }
    }
  }
  return this;
}

function applyHeadersAndStatus() {
  const { _headers, statusCode } = this;

  if (typeof statusCode === 'string') {
    this.writeStatus(statusCode);
    this.statusCode = 200;
  }

  for (const header in _headers) {
    const value = _headers[header];

    if (value) {
      if (value.splice) {
        this.writeHeaderValues(header, value);
      } else {
        this.writeHeader(header, value);
      }
      this.removeHeader(header);
    }
  }

  return this;
}



var HttpHeaderResponseChunks = /*#__PURE__*/Object.freeze({
  setHeader: setHeader,
  getHeader: getHeader,
  hasHeader: hasHeader,
  removeHeader: removeHeader,
  setHeaders: setHeaders,
  writeHeaderValues: writeHeaderValues,
  writeHeaders: writeHeaders,
  applyHeadersAndStatus: applyHeadersAndStatus
});

const HttpHeaderResponse = {
  ...HttpHeaderResponseChunks
};

HttpHeaderResponse.header = HttpHeaderResponse.setHeader;

function status(code) {
  if (this.modifyEnd && !this._modifiedEnd) {
    this.modifyEnd();
  }

  if (typeof code === 'string') {
    this.statusCode = code;
    this.rawStatusCode = parseInt(code);
  } else if (http.STATUS_CODES[code] !== undefined) {
    this.statusCode = code + ' ' + http.STATUS_CODES[code];
    this.rawStatusCode = code;
  } else {
    throw new Error('Invalid Code: ' + JSON.stringify(code));
  }

  return this;
}

function writeHead(code, headers) {
  if (typeof code === 'object' && !headers) {
    headers = code;
    code = 200;
  }

  if (code !== undefined && code !== 200) {
    this.status(code);
  }
  if (headers !== undefined) {
    this.setHeaders(headers);
  }

  return this;
}

const HTTP_PREFIX = 'http://';
const HTTPS_PREFIX = 'https://';

const normalizeLocation = (path, config, host) => {
  if (path.indexOf('http') === -1) {
    if (path.indexOf('/') === -1) {
      path = '/' + path;
    }
    let httpHost;
    if (host) {
      httpHost = host;
    } else if (config && config.host) {
      httpHost = config.host;
      httpHost += config.port ? `:${config.port}` : '';
    }
    if (httpHost) {
      path =
        (config && config.https ? HTTPS_PREFIX : HTTP_PREFIX) + httpHost + path;
    }
  }
  return path;
};

function redirect(code, path) {
  const { __request, config } = this;
  const host = __request && __request.headers && __request.headers.host;

  if (!path && typeof code === 'string') {
    path = code;
    code = 301;
  }

  let Location = '';
  if (path) {
    Location = normalizeLocation(path, config, host);
  }

  this.writeHead(code, { Location });
  this.end();

  return this;
}



var HttpResponsePolyfillChunks = /*#__PURE__*/Object.freeze({
  status: status,
  writeHead: writeHead,
  redirect: redirect
});

const HttpResponsePolyfill = {
  ...HttpResponsePolyfillChunks
};

const HttpResponse = {
  ...HttpHeaderResponse,
  ...HttpCookieResponse,
  ...HttpResponseChunks,
  ...HttpResponsePolyfill
};

// Aliases for beginners and/or users from Express!
HttpResponse.json = HttpResponse.send;

// Add stream feature by just method
// for easy and clean code
HttpResponse.sendFile = sendFile;

HttpResponse.code = HttpResponse.status;

var isHttpCode = (code) => {
  code = +code;
  if (typeof code === 'number' && code > 100 && code < 600) {
    return true;
  }
  return false;
};

const validationMethods = [
  'response',
  'query',
  'params',
  'cookies',
  'headers',
  'body'
];
const validationSchema = {
  type: 'object',
  properties: {
    type: { type: 'string' },
    errors: {
      type: 'object',
      properties: {
        headers: {
          type: 'array',
          items: { type: 'string' }
        },
        cookies: {
          type: 'array',
          items: { type: 'string' }
        },
        query: {
          type: 'array',
          items: { type: 'string' }
        },
        params: {
          type: 'array',
          items: { type: 'string' }
        },
        body: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  }
};

var prepareValidation = (ajv, schema) => {
  const validation = [];
  let validationStringify;
  let responseSchema;

  if (schema) {
    for (let i = 0, len = validationMethods.length, type; i < len; i++) {
      type = validationMethods[i];
      const _schema = schema[type];
      if (typeof _schema === 'object' && _schema) {
        if (type === 'response') {
          const isHttpCodes = Object.keys(_schema).every(isHttpCode);

          let newSchema;
          if (isHttpCodes) {
            newSchema = {};
            for (const code in _schema) {
              newSchema[code] = fastJson(_schema[code]);
            }
          } else {
            newSchema = fastJson(_schema);
          }

          responseSchema = newSchema;
        } else {
          if (ajv) {
            const validator = ajv.compile(_schema);
            validation.push({ type, validator, schema: _schema });
            if (!validationStringify) {
              validationStringify = fastJson(validationSchema);
            }
          }
        }
      }
    }
  }

  return {
    validation,
    validationStringify,
    responseSchema
  };
};

var processValidation = (req, res, config, { validationStringify, validation } = {}) => {
  if (validationStringify) {
    let errors;
    for (let i = 0, len = validation.length; i < len; i++) {
      const { type, validator, schema } = validation[i];

      const reqValue = req[type];

      if (reqValue === undefined) {
        if (schema && schema.required) {
          if (!errors) {
            errors = {
              type: 'errors',
              errors: { [type]: [type + ' is not missing'] }
            };
          } else {
            const _errors = errors.errors;

            if (_errors[type]) {
              _errors[type].push(type + ' is not missing');
            } else {
              _errors[type] = [type + ' is not missing'];
            }
          }
        }
        continue;
      }

      const valid = validator(reqValue);

      if (!valid) {
        if (!errors) {
          errors = {
            type: 'errors',
            errors: { [type]: validator.errors.map((err) => err.message) }
          };
        } else {
          const _errors = errors.errors;

          if (_errors[type]) {
            _errors[type].push(...validator.errors.map((err) => err.message));
          } else {
            _errors[type] = validator.errors.map((err) => err.message);
          }
        }
      }
    }

    if (errors) {
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
};

function swaggerDocsGenerator(
  swaggerDef,
  path,
  method,
  { schema, contentType = '*', ...routeConfigs } = {}
) {
  if (!schema) {
    return;
  }
  if (swaggerDef.paths === undefined) {
    swaggerDef.paths = {};
  }

  for (const typeName in schema) {
    if (schema[typeName] === false) {
      continue;
    }

    const type =
      typeName === 'params'
        ? 'path'
        : typeName === 'response'
          ? 'responses'
          : typeName === 'body'
            ? 'requestBody'
            : typeName;

    if (swaggerDef.paths[path] === undefined) {
      swaggerDef.paths[path] = {};
    }

    const defPath = swaggerDef.paths[path];
    if (defPath[method] === undefined) {
      defPath[method] = routeConfigs;
    }

    const methodInstance = defPath[method];

    let schemaItem = schema[typeName];
    const schemaKeys = Object.keys(schemaItem).every(isHttpCode);

    if (
      typeName === 'query' ||
      typeName === 'params' ||
      typeName === 'headers'
    ) {
      if (!methodInstance.parameters) {
        methodInstance.parameters = [];
      }
      for (const name in schemaItem.properties) {
        const value = schemaItem.properties[name];

        methodInstance.parameters.push({
          name,
          in: type,
          description: value.description,
          required:
            value.required ||
            (schemaItem.required && schemaItem.required.indexOf(name) !== -1),
          schema: value
        });
      }
      continue;
    } else if (!schemaKeys && typeName === 'response') {
      schema[typeName] = { 200: schemaItem };
    }
    schemaItem = schema[typeName];

    if (!schemaItem.content) {
      if (typeName === 'response') {
        for (const httpCode in schema[typeName]) {
          let value = schema[typeName][httpCode];

          if (!value.content) {
            schema[typeName][httpCode] = { content: { [contentType]: value } };
            value = schema[typeName][httpCode].content[contentType];
          }

          if (!value.schema) {
            schema[typeName][httpCode].content[contentType] = { schema: value };
          }
        }
      } else {
        let value = schemaItem;
        if (!value.content) {
          schema[typeName] = { content: { [contentType]: value } };
          value = schema[typeName].content[contentType];
        }

        if (!value.schema) {
          schema[typeName].content[contentType] = { schema: value };
        }
      }
    }

    methodInstance[type] = schema[typeName];
  }
}

var httpMethods = [
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

class Route {
  constructor(config = {}) {
    this._config = config;
    this._ajv = config.ajv;
    this._middlewares = null;

    this._baseUrl = '';

    this._module = true;
    this._rootLevel = false;
    this._hooks = config._hooks;
  }
  use(path, ...middlewares) {
    let { _middlewares } = this;

    if (!_middlewares) {
      _middlewares = [];
      this._middlewares = _middlewares;
    }

    if (typeof path === 'function') {
      middlewares.unshift(path);
      path = undefined;
    }

    _middlewares.push(...middlewares);

    for (let i = 0, len = _middlewares.length, middleware; i < len; i++) {
      middleware = _middlewares[i];
      if (!middleware) {
        continue;
      }
      if (middleware._module) {
        middleware._ajv = this._ajv;
        middleware._config = this._config;
        middleware._app = this._app;

        if (typeof path === 'string') {
          middleware._baseUrl = path;
          middleware.path = path;
        } else {
          middleware._baseUrl = this._baseUrl;
          middleware._direct = true;
        }
      } else if (!middleware.path) {
        if (typeof path === 'string') {
          middleware._baseUrl = path;
          middleware.path = path;
        } else {
          middleware._direct = true;
          middleware._baseUrl = this._baseUrl;
        }
      }
      middleware.discard =
        (!middleware._module &&
          /res\.(json|s?end|cork|sendFile)/g.test(middleware.toString())) ||
        middleware.toString().indexOf('next') === -1;
    }

    return this;
  }
  _prepareMethod(method, path, _hooks, ...middlewares) {
    const { _config, _baseUrl, _middlewares, _module, _rootLevel, _ajv } = this;
    const getHooks = (name) => {
      return _hooks[name].concat((_hooks[path] && _hooks[path][name]) || []);
    };
    const fetchMethod = method === 'any';
    const fetchUrl =
      path === '/*' || path.indexOf(':') !== -1 || (_module && !_rootLevel);
    let validation = null;
    let _direct = false;
    let _schema = null;
    let isAborted = false;
    const bodyAllowedMethod =
      method === 'post' ||
      method === 'put' ||
      method === 'del' ||
      method === 'delete';
    let responseSchema;
    const isRaw = middlewares.find(
      (middleware) =>
        typeof middleware === 'object' &&
        middleware &&
        middleware.isRaw === true
    );
    const noMiddleware = middlewares.find(
      (middleware) =>
        typeof middleware === 'object' &&
        middleware &&
        middleware.noMiddleware === true
    );
    let schema = middlewares.find(
      (middleware) =>
        typeof middleware === 'object' &&
        middleware &&
        typeof middleware.schema === 'object'
    );

    if (typeof schema === 'object') {
      schema.handler &&
        typeof schema.handler === 'function' &&
        middlewares.push(schema.handler);
      // add path hook
      const addHooks = [
        'onRequest',
        'preParsing',
        'preValidation',
        'preHandler',
        'preSerialization'
      ];
      const addPathHooks = () => {
        for (const name of addHooks) {
          if (schema[name]) {
            if (schema[name].constructor === Array) {
              _hooks[path][name] = schema[name];
            } else {
              _hooks[path][name] = [schema[name]];
            }
          }
        }
      };
      addPathHooks();
    }

    middlewares = middlewares.filter(
      (middleware) => typeof middleware === 'function'
    );

    if (_middlewares && _middlewares.length > 0) {
      middlewares = _middlewares.concat(middlewares);
    }

    if (noMiddleware) {
      middlewares.length = 0;
    }

    let routeFunction = middlewares.pop();

    if (typeof path === 'function' && !routeFunction) {
      _direct = true;
      routeFunction = path;
    } else if (typeof schema === 'function' && !routeFunction) {
      routeFunction = schema;
      schema = null;
    }

    _schema = (schema && schema.schema) || undefined;
    validation = _schema && prepareValidation(_ajv, _schema);
    // eslint-disable-next-line prefer-const
    responseSchema = _schema && validation && validation.responseSchema;

    if (
      routeFunction.then ||
      routeFunction.constructor.name === 'AsyncFunction'
    ) {
      const _oldRouteFunction = routeFunction;
      routeFunction = (req, res) => {
        // run _hooks preHandler
        hookRunner(getHooks('preHandlers'), hookIterator, req, res, () => {});
        return _oldRouteFunction(req, res)
          .then((data) => {
            if (!isAborted && data && data !== res) {
              return res.send(data);
            }
            return null;
          })
          .catch((err) => {
            if (!isAborted) {
              if (_config._errorHandler) {
                return _config._errorHandler(err, req, res);
              }
              res.status(err.code || err.status || 500);
              return res.send({ error: err.message });
            }
            return null;
          });
      };
    }

    middlewares = middlewares
      .map((middleware) => {
        if (middleware._module) ; else if (
          middleware.then ||
          middleware.constructor.name === 'AsyncFunction'
        ) ; else {
          const _oldMiddleware = middleware;
          middleware = (req, res) =>
            new Promise((resolve) => {
              _oldMiddleware(req, res, (err, done) => {
                if (err) {
                  finished = true;
                  if (_config._errorHandler) {
                    return _config._errorHandler(err, req, res);
                  }
                  res.statusCode = err.code || err.status || 400;
                  res.send(
                    `{"error":"${typeof err === 'string' ? err : err.message}"}`
                  );
                  resolve();
                } else {
                  resolve(done);
                }
              });
            });
        }
        return middleware;
      })
      .filter((middleware) => typeof middleware === 'function');

    if (_config && _config.swagger && schema) {
      swaggerDocsGenerator(_config.swagger, path, method, schema);
    }

    if (!_config.strictPath && path) {
      if (
        path.charAt(path.length - 1) !== '/' &&
        Math.abs(path.lastIndexOf('.') - path.length) > 5
      ) {
        path += '/';
      }
    }

    let finished = false;
    const rawPath = path;
    return async (res, req) => {
      isAborted = false;
      res.onAborted(() => {
        isAborted = true;
      });

      req.rawPath = rawPath;
      req.method = fetchMethod ? req.getMethod() : method;
      req.path = fetchUrl ? req.getUrl() : path;
      req.baseUrl = _baseUrl || req.baseUrl;
      req.rawPath = path || req.path;

      // Aliases for polyfill
      req.url = req.path;
      req.originalUrl = req.url;
      req.baseUrl = _baseUrl || '';

      // Aliases for future usage and easy-access
      if (!isRaw) {
        req.__response = res;
        res.__request = req;

        // Extending proto
        const { __proto__ } = res;
        for (const newMethod in HttpResponse) {
          __proto__[newMethod] = HttpResponse[newMethod];
        }
        res.writeHead.notModified = true;
      }
      res.__hooks = _hooks;

      // Default HTTP Raw Status Code Integer
      res.rawStatusCode = 200;

      // Assign schemas
      if (responseSchema) {
        res.fastJson = responseSchema;
      }

      if (!isRaw && _schema !== false) {
        if (!_schema || _schema.headers !== false) {
          req.headers = headers(req, _schema && _schema.headers);
        }
        if (!_schema || _schema.cookies !== false) {
          req.cookies = cookies(req, _schema && _schema.cookies);
        }
        if (!_schema || _schema.params !== false) {
          if (req.path !== path) {
            path = req.path;
          }
          req.params = params(req, _schema && _schema.params);
        }
        if (!_schema || _schema.query !== false) {
          req.query = queries(req, _schema && _schema.query);
        }
      }

      // Caching value may improve performance
      // by avoid re-reference items over again
      let reqPathLength = req.path.length;

      if (!_config.strictPath && reqPathLength > 1) {
        const dotIndex = req.path.lastIndexOf('.');
        if (
          req.path.charAt(reqPathLength - 1) !== '/' &&
          (dotIndex === -1 ||
            (dotIndex !== -1 && Math.abs(dotIndex - req.path.length)) > 5)
        ) {
          if (req.path === path) {
            path += '/';
          }
          req.path += '/';
          reqPathLength += 1;
        }
      }
      // run _hooks onRequest
      hookRunner(getHooks('onRequest'), hookIterator, req, res, () => {});

      if (middlewares && middlewares.length > 0) {
        for (let i = 0, len = middlewares.length, middleware; i < len; i++) {
          middleware = middlewares[i];

          if (finished) {
            break;
          }

          await middleware(req, res);
        }
      }

      if (finished || isAborted) {
        return;
      }

      if (_direct || !fetchUrl || req.path === path) {
        if (
          !isRaw &&
          (!res._modifiedEnd &&
            (!res.writeHead.notModified ||
              (res.statusCode && res.statusCode !== 200) ||
              res._headers))
        ) {
          res.modifyEnd();
        }

        // run _hooks preParsing
        hookRunner(getHooks('preParsing'), hookIterator, req, res, () => {});

        if (
          !isRaw &&
          bodyAllowedMethod &&
          res.onData &&
          _schema !== false &&
          (!_schema || !_schema.body !== false)
        ) {
          const bodyResponse = await body(req, res);

          if (isAborted) {
            return;
          }
          if (bodyResponse) {
            req.body = bodyResponse;
          }

          // run _hooks preParsing
          hookRunner(
            getHooks('preValidation'),
            hookIterator,
            req,
            res,
            () => {}
          );
          if (
            isAborted ||
            (!isRaw &&
              validation &&
              validation.validationStringify &&
              processValidation(req, res, _config, validation))
          ) {
            return;
          }

          return routeFunction(req, res);
        } else {
          if (
            isAborted ||
            (!isRaw &&
              validation &&
              validation.validationStringify &&
              processValidation(req, res, _config, validation))
          ) {
            return;
          }

          return routeFunction(req, res);
        }
      }
    };
  }
}

for (let i = 0, len = httpMethods.length; i < len; i++) {
  const method = httpMethods[i];
  Route.prototype[method] = function(path, ...middlewares) {
    const { _baseUrl, _module, _app, _config } = this;

    if (middlewares.length > 0) {
      if (_baseUrl !== '' && _module && path.indexOf(_baseUrl) === -1) {
        path = _baseUrl + path;
      }

      let _path = path;
      if (!_config.strictPath && path) {
        if (
          path.charAt(path.length - 1) !== '/' &&
          Math.abs(path.lastIndexOf('.') - path.length) > 5
        ) {
          _path += '/';
        }
      }

      _app[method](_path, this._prepareMethod(method, path, ...middlewares));
    }

    return this;
  };
}

module.exports = Route;
