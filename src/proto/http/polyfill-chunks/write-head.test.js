/* global describe, expect, it */
import HttpResponse from '../../../../tests/mock/HttpResponse';
import { default as writeHead } from './write-head';

describe('writeHead status', () => {
  it('empty status should do nothing', async (done) => {
    const res = new HttpResponse();
    writeHead.call(res);
    done();
  });
  it('string status code should work', () => {
    const res = new HttpResponse();
    writeHead.call(res, '201 Created');

    expect(res.statusCode).toBe('201 Created');
  });
});

describe('writeHead headers', () => {
  it('empty status should do nothing', async (done) => {
    const res = new HttpResponse();
    writeHead.call(res, 201);
    done();
  });
  it('http headers should work', () => {
    const res = new HttpResponse();
    writeHead.call(res, 201, { Location: '/path' });

    expect(res.statusCode).toBe('201 Created');
    expect(res._headers).toStrictEqual({
      Location: '/path'
    });
  });
});
