'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var uWS = _interopDefault(require('uWebSockets.js'));
var fs = _interopDefault(require('fs'));
var path = require('path');
var util = require('util');
var util__default = _interopDefault(util);
var zlib = _interopDefault(require('zlib'));
var querystring = require('querystring');
var stream = require('stream');
var http$2 = _interopDefault(require('http'));
var Events = _interopDefault(require('@dalisoft/events'));

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
  return mimes[path.substr(i + 1).toLowerCase()] || mimes['default'];
};

function stob(stream) {
  return new Promise((resolve) => {
    const buffers = [];
    stream.on('data', buffers.push.bind(buffers));

    stream.on('end', () => {
      switch (buffers.length) {
      case 0:
        resolve(Buffer.allocUnsafe(0));
        break;
      case 1:
        resolve(buffers[0]);
        break;
      default:
        resolve(Buffer.concat(buffers));
      }
    });
  });
}

function writeHeaders(res, headers, other) {
  if (typeof other !== 'undefined') {
    res.writeHeader(headers, other.toString());
  } else {
    for (const header in headers) {
      res.writeHeader(header, headers[header].toString());
    }
  }
}

const fsStat = util__default.promisify(fs.stat);

const compressions = {
  br: zlib.createBrotliCompress,
  gzip: zlib.createGzip,
  deflate: zlib.createDeflate
};
const bytes = 'bytes=';

async function sendFile(res, req, path, options) {
  if (!res.abortHandler) {
    res.onAborted(() => {
      if (res.stream) {
        res.stream.destroy();
      }
      res.aborted = true;
    });
    res.abortHandler = true;
  }
  return await sendFileToRes(
    res,
    {
      'if-modified-since': req.getHeader('if-modified-since'),
      range: req.getHeader('range'),
      'accept-encoding': req.getHeader('accept-encoding')
    },
    path,
    options
  );
}

async function sendFileToRes(
  res,
  reqHeaders,
  path,
  {
    lastModified = true,
    headers,
    compress = false,
    compressionOptions = {
      priority: ['gzip', 'br', 'deflate']
    },
    cache = false
  } = {}
) {
  // eslint-disable-next-line prefer-const
  let { mtime, size } = await fsStat(path);
  mtime.setMilliseconds(0);
  const mtimeutc = mtime.toUTCString();

  headers = Object.assign({}, headers);
  // handling last modified
  if (lastModified) {
    // Return 304 if last-modified
    if (reqHeaders['if-modified-since']) {
      if (new Date(reqHeaders['if-modified-since']) >= mtime) {
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

  if (reqHeaders.range) {
    compress = false;
    const parts = reqHeaders.range.replace(bytes, '').split('-');
    start = parseInt(parts[0], 10);
    end = parts[1] ? parseInt(parts[1], 10) : end;
    headers['accept-ranges'] = 'bytes';
    headers['content-range'] = `bytes ${start}-${end}/${size}`;
    size = end - start + 1;
    res.writeStatus('206 Partial Content');
  }

  // for size = 0
  if (end < 0) end = 0;

  let readStream = fs.createReadStream(path, { start, end });
  res.stream = readStream;

  // Compression;
  let compressed = false;
  if (compress) {
    const l = compressionOptions.priority.length;
    for (let i = 0; i < l; i++) {
      const type = compressionOptions.priority[i];
      if (reqHeaders['accept-encoding'].indexOf(type) > -1) {
        compressed = type;
        const compressor = compressions[type](compressionOptions);
        readStream.pipe(compressor);
        readStream = compressor;
        headers['content-encoding'] = compressionOptions.priority[i];
        break;
      }
    }
  }

  res.onAborted(() => readStream.destroy());
  writeHeaders(res, headers);
  // check cache
  if (cache) {
    return cache.wrap(
      `${path}_${mtimeutc}_${start}_${end}_${compressed}`,
      (cb) => {
        stob(readStream)
          .then((b) => cb(null, b))
          .catch(cb);
      },
      { ttl: 0 },
      (err, buffer) => {
        if (err) {
          res.writeStatus('500 Internal server error');
          res.end();
          throw err;
        }
        res.end(buffer);
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
      res.writeStatus('500 Internal server error');
      res.end();
      readStream.destroy();
    })
    .on('end', () => {
      res.end();
    });
}

var headers = (req, headers, schema) => {
  if (schema) {
    const { properties } = schema;
    for (const property in properties) {
      if (!headers) {
        headers = {};
      }
      headers[property] = req.getHeader(property);
    }
    return headers;
  } else {
    req.forEach((key, value) => {
      if (!headers) {
        headers = {};
      }
      headers[key] = value;
    });
  }
  return headers;
};

let cookie;

try {
  cookie = require('cookie');
} catch (e) {
  console.error(
    '[nanoexpress]: `cookie` was not found in your dependencies list' +
      ', please install yourself for this feature working properly'
  );
}

var cookies = (req, cookies) => {
  if (!cookie || !cookie.parse) {
    return;
  }
  const { headers } = req;
  const headerCookie =
    (headers && headers.cookie) || (req && req.getHeader('Cookie'));

  if (headerCookie) {
    if (cookies) {
      const parsedCookie = cookie.parse(headerCookie);
      for (const cookie in parsedCookie) {
        cookies[cookie] = parsedCookie[cookie];
      }
    } else if (!cookies) {
      cookies = cookie.parse(headerCookie);
    }
  }
  return cookies;
};

var queries = (req, queries) => {
  const query = req.getQuery();

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

const { parse } = require('querystring');

var body = async (req, res) => {
  const stream$1 = new stream.Readable();
  stream$1._read = () => true;
  req.pipe = stream$1.pipe.bind(stream$1);
  req.stream = stream$1;

  if (!res || !res.onData) {
    return undefined;
  }

  let body = await new Promise((resolve) => {
    /* Register error cb */
    if (!res.abortHandler && res.onAborted) {
      res.onAborted(() => {
        if (res.stream) {
          res.stream.destroy();
        }
        res.aborted = true;
        resolve();
      });
      res.abortHandler = true;
    }

    let buffer;
    res.onData((chunkPart, isLast) => {
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
        body = parse(req.body);
      }
    }
  }

  return body;
};

const PARAMS_REGEX = /:([A-Za-z0-9_-]+)/g;

var params = (req, params) => {
  const { rawPath } = req;

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

function getIPBuffer() {
  return this.__response.getRemoteAddress();
}

var request = (req, res, bodyCall, schema) => {
  req.path = req.getUrl();
  req.url = req.path;
  req.method = req.method || req.getMethod();

  // Alias for Express-module
  // TODO: make this normalized
  req.url = req.path;
  req.originalUrl = req.url;
  req.baseUrl = '';

  req.__response = res;
  req.getIPBuffer = getIPBuffer;

  req.headers =
    !schema || schema.headers !== false
      ? headers(req, req.headers, schema && schema.headers)
      : req.headers;
  req.cookies =
    !schema || schema.cookies !== false
      ? cookies(req, req.cookies, schema && schema.cookies)
      : req.cookies;
  req.params =
    !schema || schema.params !== false
      ? params(req, req.params, schema && schema.params)
      : req.params;
  req.query =
    !schema || schema.query !== false
      ? queries(req, req.query, schema && schema.query)
      : req.query;

  if (bodyCall) {
    return body(req, res).then((body) => {
      req.body = body;
      return req;
    });
  }

  return req;
};

const fsStat$1 = util__default.promisify(fs.stat);

const compressions$1 = {
  br: zlib.createBrotliCompress,
  gzip: zlib.createGzip,
  deflate: zlib.createDeflate
};
const bytes$1 = 'bytes=';

async function sendFile$1(
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
  if (!this.abortHandler) {
    this.onAborted(() => {
      if (this.stream) {
        this.stream.destroy();
      }
      this.aborted = true;
    });
    this.abortHandler = true;
  }

  const res = this;
  const stat = await fsStat$1(path);
  const { mtime } = stat;
  let { size } = stat;

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
    const parts = headers.range.replace(bytes$1, '').split('-');
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
        const compressor = compressions$1[type](compressionOptions);
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
      res.writeStatus('500 Internal server error');
      res.end();
      readStream.destroy();
    })
    .on('end', () => {
      res.end();
    });
}

function modifyEnd() {
  if (!this._modifiedEnd) {
    const _oldEnd = this.end;

    this.end = function(chunk, encoding) {
      // eslint-disable-next-line prefer-const
      let { _headers, statusCode } = this;

      if (typeof statusCode === 'number') {
        this.status(statusCode);
        statusCode = this.statusCode;
      }
      if (_headers) {
        if (statusCode) {
          this.writeStatus(statusCode);
        }

        this.applyHeadersAndStatus();
      } else if (statusCode) {
        this.writeStatus(statusCode);
      }

      return _oldEnd.call(this, chunk, encoding);
    };

    this._modifiedEnd = true;
  }
  return this;
}

function send(result) {
  /* If we were aborted, you cannot respond */
  if (this.aborted) {
    console.error('[Server]: Error, Response was aborted before responsing');
    return undefined;
  }
  if (this._headers && this.writeHead && !this._headWritten && !this.aborted) {
    this.writeHead(this.statusCode || 200, this._headers);
    this._headWritten = true;
  }
  if ((this.statusCode || this._headers) && !this._modifiedEnd) {
    this.modifyEnd();
  }

  if (result === null || result === undefined) {
    this.end('');
  } else if (typeof result === 'object') {
    this.setHeader('Content-Type', 'application/json');
    if (this.schema) {
      const { schema } = this;

      const schemaWithCode = schema[this.rawStatusCode];

      if (schemaWithCode) {
        result = schemaWithCode(result);
      } else {
        result = schema(result);
      }
    } else {
      result = JSON.stringify(result);
    }

    this.end(result);
  } else {
    this.end(result);
  }

  return this;
}

function cork(fn) {
  if (this.experimental_cork) {
    this.experimental_cork(fn);
  }

  return this;
}

function type(type) {
  this.setHeader('Content-Type', type);

  return this;
}



var HttpResponseChunks = /*#__PURE__*/Object.freeze({
  modifyEnd: modifyEnd,
  send: send,
  cork: cork,
  type: type
});

let cookie$1;

try {
  cookie$1 = require('cookie');
} catch (e) {
  console.error(
    '[nanoexpress]: `cookie` was not found in your dependencies list' +
      ', please install yourself for this feature working properly'
  );
}

function setCookie(name, value, options) {
  if (!cookie$1 || !cookie$1.serialize) {
    return;
  }

  if (options.expires && Number.isInteger(options.expires)) {
    options.expires = new Date(options.expires);
  }
  const serialized = cookie$1.serialize(name, value, options);

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

function writeHeaders$1(headers) {
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
  writeHeaders: writeHeaders$1,
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
  } else if (http$2.STATUS_CODES[code] !== undefined) {
    this.statusCode = code + ' ' + http$2.STATUS_CODES[code];
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

  if (code !== undefined) {
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
  this.aborted = true;

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
HttpResponse.sendFile = sendFile$1;

HttpResponse.code = HttpResponse.status;

var response = (res, req, config) => {
  // Attach request
  res.__request = req;

  // Extending proto
  const { __proto__ } = res;
  for (const newMethod in HttpResponse) {
    __proto__[newMethod] = HttpResponse[newMethod];
  }

  // Default HTTP Raw Status Code Integer
  res.rawStatusCode = 200;

  // Attach Config
  res.config = config;

  return res;
};

const proto = Events.prototype;

var ws = (ws) => {
  ws.on = proto.on;
  ws.once = proto.once;
  ws.off = proto.off;
  ws.emit = proto.emit;

  ws.___events = [];

  return ws;
};

// Constants
const appMethods = [
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'head',
  'options',
  'trace',
  'any',
  'ws'
];

// Utils
const pathKeyNormalizer = (path) =>
  path.indexOf('{') !== -1 ? path.replace(/\{(.*)\}/g, ':$1') : path;

var routeMapper = (app) => async (prefix, routes) => {
  if (typeof prefix !== 'string' && !routes) {
    routes = prefix;
    prefix = '';
  }
  (function normalizeRoutes(path, appRoutes, route = false) {
    if (appRoutes.normalized) {
      return undefined;
    }
    if (route && path) {
      routes[path] = appRoutes;
      return undefined;
    }
    for (const key in appRoutes) {
      const value = appRoutes[key];
      const keysOfValue = value && Object.keys(value);
      const normalisedKey = pathKeyNormalizer(key);

      if (
        path === '/' &&
        keysOfValue.every((key) => appMethods.includes(key))
      ) {
        for (const method in value) {
          const routeCallback = value[method];
          value[method] =
            typeof routeCallback === 'function'
              ? { callback: routeCallback }
              : routeCallback;
        }

        normalizeRoutes(path, value, true);
      } else if (
        keysOfValue.every((key) => !appMethods.includes(key)) &&
        (!path || path === '/' || key.startsWith('/'))
      ) {
        if (path === normalisedKey) {
          path = '';
        } else if ((path + normalisedKey).startsWith('//')) {
          path = '';
        }

        for (const route in value) {
          normalizeRoutes(path + normalisedKey + route, value[route]);
        }

        delete appRoutes[key];
      } else if (
        keysOfValue &&
        keysOfValue.every((key) => appMethods.includes(key))
      ) {
        const route = routes[path];
        const normalisedValue =
          typeof value === 'function' ? { callback: value } : value;

        if (route) {
          route[key] = normalisedValue;
        } else {
          routes[path] = {
            [key]: normalisedValue
          };
        }
      } else if (
        keysOfValue &&
        keysOfValue.some((key) => appMethods.includes(key))
      ) {
        for (const method in value) {
          if (appMethods.includes(method)) {
            if (!value[method].callback) {
              value[method] = { callback: value[method] };
            }
          } else {
            let normalisedPath = method;
            if (method.startsWith('/') && path.endsWith('/')) {
              normalisedPath = method.substr(1);
            }
            normalizeRoutes(path + normalisedPath, value[method]);
            delete value[method];
          }
        }
      } else {
        console.error(
          `[nanoexpress]: The Schema of [${path}]` +
            'is missing, please add schema!'
        );
      }
    }
  })('/' + prefix, routes, false);

  // This prevents from N+1 normalize
  routes.normalized = true;

  for (const path in routes) {
    const route = routes[path];
    const methods = Object.keys(route);

    if (route) {
      for await (const method of methods) {
        // eslint-disable-next-line prefer-const
        let { callback, middlewares = [], schema } = route[method];

        if (schema) {
          middlewares.unshift({ schema });
        }

        middlewares.push(callback);

        await app[method](path, ...middlewares);
      }
    }
  }
  return app;
};

const HttpRequestAdvancedProps = [
  'params',
  'query',
  'cookies',
  'body',
  'path',
  'rawPath',
  'url',
  'method'
];
const AllowedMembers = ['req', 'res'];

const lineGoHandle = (string, handler) =>
  string
    .split('\n')
    .map(handler)
    .join('\n');

const isMalicius = (string) =>
  !string.startsWith('async') && !string.startsWith('(re');

var isSimpleHandler = (fn, isRaw = true) => {
  const fnString = fn.toString();

  if (
    fnString.length > 1024 ||
    fnString.indexOf('res.end') === -1 ||
    fnString.indexOf('middleware') !== -1 ||
    fnString.indexOf('prepared') !== -1
  ) {
    return {
      simple: false,
      reason: 'complex'
    };
  }
  if (isMalicius(fnString)) {
    return {
      simple: false,
      reason: 'warning'
    };
  }

  let simple = true;
  const async =
    fnString.indexOf('await') !== -1 && fnString.indexOf('res.end') === -1;

  const newFnString = lineGoHandle(fnString, (line, index) => {
    line = line.trim();

    if (!line) {
      return line;
    }

    const member = line.replace(/return /g, '').substr(0, 3);
    const isComment = member.indexOf('//') === 0;
    if (index === 0) {
      if (line.indexOf('async') === 0 && !async) {
        line = line.substr(6);
      }
      if (line.indexOf('(req, res)') !== -1 && isRaw) {
        line = line.substr(10);
        line = '(res, req)' + line;
      }
    } else if (member && member.length === 3 && !isComment) {
      if (AllowedMembers.indexOf(member) === -1) {
        simple = false;
        return line;
      }
    }

    if (line.indexOf('req.headers') !== -1) {
      const noDirectProp = /\[|\]|'/g;
      let headerName = line.substr(line.indexOf('req.headers') + 12);
      let isDirect = true;

      if (noDirectProp.test(headerName)) {
        headerName = headerName.replace(noDirectProp, '');
        isDirect = false;
      }

      headerName = headerName.replace(/[;()]/g, '');

      if (isDirect) {
        line = line.replace(
          'req.headers.' + headerName,
          'req.getHeader(\'' + headerName + '\')'
        );
      } else {
        line = line.replace(
          'req.headers[\'' + headerName + '\']',
          'req.getHeader(\'' + headerName + '\')'
        );
      }
    }

    if (line.indexOf('req.') !== -1) {
      if (
        HttpRequestAdvancedProps.some(
          (prop) => line.indexOf('req.' + prop) !== -1
        )
      ) {
        simple = false;
      }
    }

    if (line.indexOf('res.') !== -1) {
      const matchMethod = line.match(/res\.(.*)\(/);

      if (matchMethod && HttpResponse[matchMethod[1]]) {
        simple = false;
      }
    }

    return line;
  });

  if (!simple) {
    return {
      simple,
      reason: 'mismatch'
    };
  }

  try {
    const handler = new Function('return ' + newFnString)();
    return {
      simple,
      handler
    };
  } catch (e) {
    return { simple: false, reason: 'error' };
  }
};

var prepareRouteFunctions = (fns) => {
  if (Array.isArray(fns)) {
    if (fns.length === 0) {
      return { empty: true, error: true };
    }
  } else if (typeof fns === 'function') {
    const async = fns.then || fns.constructor.name === 'AsyncFunction';
    fns.async = async;

    return { route: fns, empty: true };
  }
  const schema = fns.find((fn) => fn.schema);
  const asyncToSync = fns.find((fn) => fn.asyncToSync !== undefined);

  const prepared = fns
    .map((fn, index) => {
      let result;
      if (!fn || typeof fn === 'object') {
        return null;
      }
      const { simple, handler } = isSimpleHandler(fn, false);

      if (simple) {
        handler.simple = simple;
        handler.async = false;
        handler.type = 'simple';
        return handler;
      } else if (fn.then || fn.constructor.name === 'AsyncFunction') {
        result = fn;
        result.async = true;
        result.type = 'sync';
      } else if (
        index === fns.length - 1 &&
        fn.toString().indexOf('next)') === -1 &&
        fn.toString().indexOf('async') === -1
      ) {
        result = fn;
        result.async = false;
        result.type = 'route';
      } else {
        result = (req, res, config, prevValue) =>
          new Promise((resolve) =>
            fn(
              req,
              res,
              (error, done) => {
                if (error) {
                  return resolve({ error });
                }
                resolve(done);
              },
              config,
              prevValue
            )
          );
        result.async = true;
        result.type = 'express';
      }

      result.simple = false;
      return result;
    })
    .filter((fn) => fn);

  const allAsync = prepared.some((fn) => fn.async);
  const route = prepared.pop();

  return {
    prepared,
    empty: prepared.length === 0,
    schema,
    route,
    allAsync,
    asyncToSync
  };
};

var isHttpCode = (code) => {
  code = +code;
  if (typeof code === 'number' && code > 100 && code < 600) {
    return true;
  }
  return false;
};

let fastJson;

try {
  fastJson = require('fast-json-stringify');
} catch (e) {
  console.error(
    '[nanoexpress]: `fast-json-stringify` was not found in your dependencies list' +
      ', please install yourself for this feature working properly'
  );
}

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
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          messages: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    }
  }
};

var prepareValidation = (ajv, schema, config) => {
  const validation = [];
  let validationStringify;
  let responseSchema;

  if (schema) {
    validationMethods.forEach((type) => {
      const _schema = schema[type];
      if (typeof _schema === 'object' && _schema) {
        if (type === 'response') {
          if (typeof fastJson !== 'function') {
            console.error(
              '[nanoexpress]: `fast-json-stringify` was not initialized properly'
            );
            return;
          }
          const isHttpCodes = Object.keys(_schema).every(isHttpCode);

          const newSchema = {};
          if (isHttpCodes) {
            for (const code in _schema) {
              newSchema[code] = fastJson(_schema[code]);
            }
          } else {
            newSchema[type] = fastJson(_schema);
          }

          responseSchema = newSchema;
        } else {
          if (!ajv) {
            config.setAjv();
            ajv = config.ajv;
          } else if (typeof config.configureAjv === 'function') {
            ajv = config.configureAjv(ajv);
          }
          if (ajv) {
            const validator = ajv.compile(_schema);
            validation.push({ type, validator });
            if (!validationStringify) {
              validationStringify = fastJson(validationSchema);
            }
          }
        }
      }
    });
  }
  return {
    validation,
    validationStringify,
    responseSchema
  };
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
          required: value.required,
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

const bodyDisallowedMethods = ['get', 'options', 'head', 'trace', 'ws'];
var http = (
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

    const request$1 =
      bodyCall && res.onData
        ? await request(req, res, bodyCall, schema)
        : request(req, res, false, schema);

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

    const response$1 = response(res, req, config);

    if (
      !fn.async ||
      fn.simple ||
      fn.asyncToSync ||
      (schema && schema.asyncToSync)
    ) {
      return fn(request$1, response$1, config);
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

    const result = await fn(request$1, response$1, config);

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

var ws$1 = (path, options = {}, fn, config, ajv) => {
  // If users just opens WebSocket
  // without any parameters
  // we just normalize it for users
  if (typeof options === 'function' && !fn) {
    fn = options;
    options = {};
  }

  let validator = null;

  if (options.compression === undefined) {
    options.compression = 0;
  }
  if (options.maxPayloadLength === undefined) {
    options.maxPayloadLength = 16 * 1024 * 1024;
  }
  if (options.idleTimeout === undefined) {
    options.idleTimeout = 120;
  }
  if (options.schema !== undefined) {
    if (!ajv) {
      config.setAjv();
      ajv = config.ajv;
    }
    if (ajv) {
      validator = ajv.compile(options.schema);
    }
  }

  return {
    ...options,
    open: (ws$1, req) => {
      // For future usage
      req.rawPath = path;

      const request$1 = request(req, ws$1);
      const websocket = ws(ws$1);
      fn(request$1, websocket);
    },
    message: (ws, message, isBinary) => {
      if (!isBinary) {
        message = Buffer.from(message).toString('utf-8');
      }
      if (options.schema) {
        if (typeof message === 'string') {
          if (message.indexOf('[') === 0 || message.indexOf('{') === 0) {
            if (message.indexOf('[object') === -1) {
              message = JSON.parse(message);
            }
          }
        }

        const valid = validator(message);
        if (!valid) {
          ws.emit(
            'message',
            {
              type: 'websocket.message',
              errors: validator.errors.map((err) => err.message)
            },
            isBinary
          );
          return;
        }
      }
      ws.emit('message', message, isBinary);
    },
    drain: (ws) => {
      ws.emit('drain', ws.getBufferedAmount());
    },
    close: (ws, code, message) => {
      ws.emit('close', code, Buffer.from(message).toString('utf-8'));
    }
  };
};

var http$1 = (path = '/*', fns, config, ajv, method, app) => {
  if (typeof path === 'function') {
    if (Array.isArray(fns)) {
      fns.unshift(path);
    } else if (!fns) {
      fns = path;
    }
    path = '/*';
  }

  const {
    route,
    prepared,
    empty,
    schema,
    allAsync,
    asyncToSync,
    error
  } = prepareRouteFunctions(fns);

  const validationMap = prepareValidation(ajv, schema && schema.schema, config);

  if (config.swagger) {
    swaggerDocsGenerator(config.swagger, path, method, schema);

    if (!app.swaggerApplied) {
      app.get('/docs/swagger.json', { isRaw: true }, (req, res) => {
        res.writeHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(config.swagger, null, 4));
      });
      app.swaggerApplied = true;
    }
  }

  if (error) {
    return config._notFoundHandler
      ? config._notFoundHandler
      : (res) =>
        res.end(
          '{"middleware_type":"sync","error":"The route handler not found"}'
        );
  }

  if (route === undefined) {
    console.error('[nanoexpress]: Route - route function was not defined', {
      route,
      path,
      method
    });
    return;
  }

  const handler = empty
    ? route
    : async (req, res, config) => {
      let middlewareChainingTransferPreviousResult;
      for (const fn of prepared) {
        if (fn.simple || !fn.async) {
          fn(req, res, config, middlewareChainingTransferPreviousResult);

          if (error && !middlewareChainingTransferPreviousResult) {
            if (error && !res.aborted) {
              if (config._errorHandler) {
                return config._errorHandler(error, req, res);
              }
              return res.end(
                `{"middleware_type":"${fn.type}",error":"${error.message}"}`
              );
            }
            return;
          }
        } else {
          const middleware = await fn(
            req,
            res,
            config,
            middlewareChainingTransferPreviousResult
          ).catch((error) => ({
            error
          }));

          if (middleware && middleware.error) {
            if (!res.aborted) {
              if (config._errorHandler) {
                return config._errorHandler(middleware.error, req, res);
              }
              return res.end(
                `{"middleware_type":"${fn.type}",error":"${middleware.error.message}"}`
              );
            }
            return;
          }

          middlewareChainingTransferPreviousResult = middleware;
        }
      }

      if (method === 'options') {
        return undefined;
      }

      if (!route.async || route.simple) {
        route(req, res, config, middlewareChainingTransferPreviousResult);
        return;
      }

      return route(
        req,
        res,
        config,
        middlewareChainingTransferPreviousResult
      );
    };

  handler.async = empty ? route.async : allAsync;
  handler.simple = route.simple;
  handler.asyncToSync = asyncToSync;

  return http(path, handler, config, schema, ajv, method, validationMap);
};

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

const { FST_ERR_DEC_ALREADY_PRESENT, FST_ERR_DEC_MISSING_DEPENDENCY  } = codes;
function decorateNanoexpress(name, fn, dependencies) {
  decorate(this, name, fn, dependencies);
  return this;
}

function decorate(instance, name, fn, dependencies) {
  // eslint-disable-next-line no-prototype-builtins
  if (instance.hasOwnProperty(name)) {
    throw new FST_ERR_DEC_ALREADY_PRESENT(name);
  }

  if (dependencies) {
    checkDependencies(instance, dependencies);
  }

  if (
    fn &&
    (typeof fn.getter === 'function' || typeof fn.setter === 'function')
  ) {
    Object.defineProperty(instance, name, {
      get: fn.getter,
      set: fn.setter
    });
  } else {
    instance[name] = fn;
  }
}

function checkDependencies(instance, deps) {
  for (var i = 0; i < deps.length; i++) {
    if (!checkExistence(instance, deps[i])) {
      throw new FST_ERR_DEC_MISSING_DEPENDENCY(deps[i]);
    }
  }
}

function checkExistence(instance, name) {
  if (name) {
    return name in instance;
  }

  return instance in this;
}

const readFile = util__default.promisify(fs.readFile);

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
          : ws$1(path, options, fn, config, ajv)
      );
      return _app;
    },
    static: function staticRoute(
      route,
      path$1,
      { index = 'index.html', addPrettyUrl = true, streamConfig } = {}
    ) {
      if (path$1 === undefined) {
        path$1 = route;
        route = '/';
      } else if (!route.endsWith('/')) {
        route += '/';
      }

      const staticFilesPath = fs.readdirSync(path$1);

      for (const fileName of staticFilesPath) {
        const pathNormalisedFileName = path.resolve(path$1, fileName);

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
      const handler = http$1(
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

module.exports = nanoexpress;
