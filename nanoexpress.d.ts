import {
  AppOptions as AppOptionsBasic,
  TemplatedApp as AppTemplatedApp,
  HttpRequest as HttpRequestBasic,
  HttpResponse as HttpResponseBasic,
  WebSocket as WebSocketBasic
} from 'uWebSockets.js';
import { Ajv, Options as AjvOptions } from 'ajv';

declare namespace nanoexpress {
  export interface SwaggerOptions {
    [key: string]: SwaggerOptions | string;
  }
  export interface AppOptions extends AppOptionsBasic {
    https?: {
      key_file_name: string;
      cert_file_name: string;
      passphare: string;
    };
    ajv?: AjvOptions;
    configureAjv(ajv: Ajv): Ajv;
    swagger?: SwaggerOptions;
  }

  export interface HttpRequestHeaders {
    [key: string]: string;
  }
  export interface HttpRequestQueries {
    [key: string]: string;
  }
  export interface HttpRequestParams {
    [key: string]: string;
  }
  export interface HttpRequestBody {
    [key: string]: string | object | any[];
  }
  export interface HttpRequestCookies {
    [key: string]: string;
  }

  export interface WebSocket extends WebSocketBasic {
    on(name: string, listener: Function);
    once(name: string, listener: Function);
    off(name: string, listener?: Function);
    emit(name: string, ...args: any[]);
  }
  export interface HttpRequest extends HttpRequestBasic {
    path: string;
    url: string;
    headers?: HttpRequestHeaders;
    cookies?: HttpRequestCookies;
    query?: HttpRequestQueries;
    params?: HttpRequestParams;
    body?: string | HttpRequestBody;
    __response?: HttpResponse;
  }

  export interface CookieOptions {
    httpOnly?: boolean;
    secure?: boolean;
    maxAge?: number;
    path?: string;
    domain?: string;
    signed?: boolean;
    expires?: number | string;
  }
  export interface HttpResponse extends HttpResponseBasic {
    status(code: number): HttpResponse;
    setHeader(key: string, value: string | number): HttpResponse;
    hasHeader(key: string): HttpResponse;
    removeHeader(key: string): HttpResponse;
    applyHeadersAndStatus(): HttpResponse;
    setHeaders(headers: HttpRequestHeaders): HttpResponse;
    writeHeaderValues(name: string, value: string[]): HttpResponse;
    writeHeaders(headers: HttpRequestHeaders): HttpResponse;
    writeHead(code: number, headers: HttpRequestHeaders): HttpResponse;
    redirect(code: number | string, path?: string): HttpResponse;
    send(result: string | object | any[]): HttpResponse;
    json(result: object | any[]): HttpResponse;
    cork(fn: Function): HttpResponse;
    setCookie(
      key: string,
      value: string,
      options?: CookieOptions
    ): HttpResponse;
    cookie(key: string, value: string, options?: CookieOptions): HttpResponse;
    hasCookie(key: string): HttpResponse;
    removeCookie(key: string, options?: CookieOptions): HttpResponse;
    __request?: HttpRequest;
  }

  type HttpRoute = (
    req: HttpRequest,
    res: HttpResponse,
    next?: Function,
    config?: object,
    previousMiddlewareResult?: any
  ) => any;
  type WsRoute = (req: HttpRequest, ws: WebSocket) => any;

  export interface AppRoute {
    get: HttpRoute;
    post: HttpRoute;
    put: HttpRoute;
    patch: HttpRoute;
    head: HttpRoute;
    delete: HttpRoute;
    options: HttpRoute;
    trace: HttpRoute;
    any: HttpRoute;
    ws: WsRoute;
  }

  interface SchemaValue {
    [key: string]: string | SchemaValue;
  }
  interface Schema {
    headers: boolean | SchemaValue;
    cookies: boolean | SchemaValue;
    query: boolean | SchemaValue;
    params: boolean | SchemaValue;
    body: string | boolean | SchemaValue;
    response: boolean | SchemaValue;
  }
  export interface WebSocketOptions {
    compression?: number;
    maxPayloadLength?: number;
    idleTimeout?: number;
    schema?: Schema;
  }
  interface MiddlewareOption {
    schema?: Schema;
    isRaw?: boolean;
    direct?: boolean;
  }

  export interface AppRoute {
    callback<HttpRequest, HttpResponse>(
      req: HttpRequest,
      res: HttpResponse
    ): any;
    middlewares?: HttpRoute[];
    schema?: Schema;
  }
  export interface AppRoutes {
    [key: string]: AppRoute | AppRoutes | Function;
  }

  export interface AppConfig {
    config: {
      [key: string]: any;
    };
  }

  export interface StaticOptions {
    index?: string;
    addPrettyUrl?: boolean;
    streamConfig?: object;
  }

  interface Middleware extends MiddlewareOption, HttpRoute {}

  interface validationErrorItems {
    type: string;
    messages: string[];
  }
  export interface validationErrors {
    type: string;
    errors: validationErrorItems;
  }

  interface nanoexpressAppInterface {
    host: string | null;
    port: number | null;
    address: string;
    static(
      route: string,
      folderPath: string,
      staticOptions?: StaticOptions
    ): nanoexpressApp;
    use(path: string | Middleware, ...fns: Middleware[]): nanoexpressApp;
    get(path: string | Middleware, ...fns: Middleware[]): nanoexpressApp;
    post(path: string | Middleware, ...fns: Middleware[]): nanoexpressApp;
    put(path: string | Middleware, ...fns: Middleware[]): nanoexpressApp;
    patch(path: string | Middleware, ...fns: Middleware[]): nanoexpressApp;
    del(path: string | Middleware, ...fns: Middleware[]): nanoexpressApp;
    options(path: string | Middleware, ...fns: Middleware[]): nanoexpressApp;
    head(path: string | Middleware, ...fns: Middleware[]): nanoexpressApp;
    trace(path: string | Middleware, ...fns: Middleware[]): nanoexpressApp;
    any(path: string | Middleware, ...fns: Middleware[]): nanoexpressApp;
    ws(path: string, options: WebSocketOptions, fn?: WsRoute): nanoexpressApp;
    listen(port: number, host?: string): Promise<nanoexpressApp>;
    close(): boolean;
    setErrorHandler(
      errorHandlerCallback: (
        err: Error,
        req: HttpRequest,
        res: HttpResponse
      ) => HttpResponse
    ): nanoexpressApp;
    setNotFoundHandler(
      notFoundHandlerCallback: (
        req: HttpRequest,
        res: HttpResponse
      ) => HttpResponse
    ): nanoexpressApp;
    setValidationErrorHandler(
      validationErrorHandlerCallback: (
        errors: validationErrors,
        req: HttpRequest,
        res: HttpResponse
      ) => any
    ): nanoexpressApp;
    config: AppConfig;
  }

  export interface nanoexpressApp
    extends Omit<AppTemplatedApp, keyof nanoexpressAppInterface>,
      nanoexpressAppInterface {}
}

declare function nanoexpress(
  options?: nanoexpress.AppOptions
): nanoexpress.nanoexpressApp;

export = nanoexpress;