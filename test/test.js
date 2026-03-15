const pkg = require('../package.json');
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const log = false;

describe(`${pkg.name} v${pkg.version}`, () => {
  const fetch = require('../dist/index.js');

  // --- Basic responses ---

  it('Requesting status 200', async () => {
    const result = await fetch('https://httpbin.org/status/200', { log: log, tries: 1 });
    assert.strictEqual(result.status, 200);
  });

  it('Requesting status 500', async () => {
    try {
      await fetch('https://httpbin.org/status/500', { log: log, tries: 2 });
      assert.fail('Should have thrown an error');
    } catch (e) {
      assert.strictEqual(e.status, 500);
    }
  });

  it('Error includes status code', async () => {
    try {
      await fetch('https://httpbin.org/status/404', { log: log, tries: 1 });
      assert.fail('Should have thrown an error');
    } catch (e) {
      assert.strictEqual(e.status, 404);
    }
  });

  it('Requesting error', async () => {
    try {
      await fetch('https://httpbin.org/status/400', { log: log, tries: 1, response: 'text', output: 'complete' });
      assert.fail('Should have thrown an error');
    } catch (e) {
      assert.ok(e instanceof Error);
    }
  });

  // --- Response formats ---

  it('Requesting raw response', async () => {
    const result = await fetch('https://httpbin.org/get', { log: log, tries: 1, response: 'raw' });
    assert.strictEqual(typeof result.status, 'number');
    assert.strictEqual(typeof result.headers, 'object');
  });

  it('Requesting plaintext', async () => {
    const result = await fetch('https://httpbin.org/robots.txt', { log: log, tries: 1, response: 'text' });
    assert.strictEqual(typeof result, 'string');
    assert.ok(result.length > 0);
  });

  it('Requesting json', async () => {
    const result = await fetch('https://httpbin.org/get', { log: log, tries: 1, response: 'json' });
    assert.strictEqual(typeof result, 'object');
    assert.ok(result.url);
  });

  it('JSON parse error throws', async () => {
    try {
      await fetch('https://httpbin.org/robots.txt', { log: log, tries: 1, response: 'json' });
      assert.fail('Should have thrown an error');
    } catch (e) {
      assert.ok(e.message.includes('Response is not JSON'));
    }
  });

  // --- Output formats ---

  it('Requesting complete output', async () => {
    const result = await fetch('https://httpbin.org/get', { log: log, tries: 1, response: 'json', output: 'complete' });
    assert.strictEqual(typeof result.status, 'number');
    assert.strictEqual(typeof result.headers, 'object');
    assert.strictEqual(typeof result.body, 'object');
    assert.strictEqual(result.status, 200);
  });

  it('Body output returns parsed response directly', async () => {
    const result = await fetch('https://httpbin.org/get', { log: log, tries: 1, response: 'json', output: 'body' });
    assert.strictEqual(typeof result, 'object');
    assert.strictEqual(result.status, undefined);
    assert.ok(result.url);
  });

  // --- Query parameters ---

  it('Adding query parameters', async () => {
    const result = await fetch('https://httpbin.org/get', { log: log, tries: 1, response: 'json', query: { foo: 'bar', num: '42' } });
    assert.strictEqual(result.args.foo, 'bar');
    assert.strictEqual(result.args.num, '42');
  });

  // --- Cache breaker ---

  it('Cache breaker enabled by default', async () => {
    const result = await fetch('https://httpbin.org/get', { log: log, tries: 1, response: 'json' });
    assert.ok(result.args.cb);
  });

  it('Cache breaker disabled', async () => {
    const result = await fetch('https://httpbin.org/get', { log: log, tries: 1, response: 'json', cacheBreaker: false });
    assert.strictEqual(result.args.cb, undefined);
  });

  // --- Headers ---

  it('Custom headers are sent', async () => {
    const result = await fetch('https://httpbin.org/get', { log: log, tries: 1, response: 'json', headers: { 'X-Custom-Header': 'test-value' } });
    assert.strictEqual(result.headers['X-Custom-Header'], 'test-value');
  });

  // --- Authorization ---

  it('Authorization auto-prefixes Bearer', async () => {
    const result = await fetch('https://httpbin.org/get', { log: log, tries: 1, response: 'json', authorization: 'XXX' });
    assert.strictEqual(result.headers.Authorization, 'Bearer XXX');
  });

  it('Authorization preserves existing Basic prefix', async () => {
    const result = await fetch('https://httpbin.org/get', { log: log, tries: 1, response: 'json', authorization: 'Basic abc123' });
    assert.strictEqual(result.headers.Authorization, 'Basic abc123');
  });

  it('Authorization preserves existing Bearer prefix', async () => {
    const result = await fetch('https://httpbin.org/get', { log: log, tries: 1, response: 'json', authorization: 'Bearer mytoken' });
    assert.strictEqual(result.headers.Authorization, 'Bearer mytoken');
  });

  // --- POST / body ---

  it('POST with JSON body', async () => {
    const result = await fetch('https://httpbin.org/post', { log: log, tries: 1, method: 'post', response: 'json', body: { hello: 'world' } });
    assert.strictEqual(result.json.hello, 'world');
    assert.strictEqual(result.headers['Content-Type'], 'application/json');
  });

  it('POST with string body', async () => {
    const result = await fetch('https://httpbin.org/post', { log: log, tries: 1, method: 'post', response: 'json', body: 'raw string body' });
    assert.strictEqual(result.data, 'raw string body');
  });

  it('PUT method works', async () => {
    const result = await fetch('https://httpbin.org/put', { log: log, tries: 1, method: 'put', response: 'json', body: { key: 'value' } });
    assert.strictEqual(result.json.key, 'value');
  });

  it('DELETE method works', async () => {
    const result = await fetch('https://httpbin.org/delete', { log: log, tries: 1, method: 'delete', response: 'json' });
    assert.strictEqual(typeof result, 'object');
  });

  // --- Validation ---

  it('Rejecting when no URL provided', async () => {
    try {
      await fetch('', { log: log, tries: 1 });
      assert.fail('Should have thrown an error');
    } catch (e) {
      assert.strictEqual(e.message, 'No URL provided.');
    }
  });

  it('URL from options.url works', async () => {
    const result = await fetch(undefined, { url: 'https://httpbin.org/get', log: log, tries: 1, response: 'json' });
    assert.strictEqual(typeof result, 'object');
    assert.ok(result.url);
  });

  // --- Timeout ---

  it('Timeout rejects', async () => {
    try {
      await fetch('https://httpbin.org/delay/10', { log: log, tries: 1, timeout: 1000 });
      assert.fail('Should have thrown an error');
    } catch (e) {
      assert.strictEqual(e.message, 'Request timed out');
    }
  });

  // --- Retries ---

  it('Retries on failure', async () => {
    const start = Date.now();
    try {
      await fetch('https://httpbin.org/status/503', { log: log, tries: 2, timeout: 5000 });
      assert.fail('Should have thrown an error');
    } catch (e) {
      const elapsed = Date.now() - start;
      assert.strictEqual(e.status, 503);
      // Should have waited ~3 seconds for backoff between attempts
      assert.ok(elapsed >= 2500, `Expected retry backoff delay, but only took ${elapsed}ms`);
    }
  });

  // --- Download ---

  it('Download file to disk', async () => {
    const downloadPath = path.join(__dirname, 'tmp', 'test-image');
    const result = await fetch('https://httpbin.org/image/png', { log: log, tries: 1, download: downloadPath });
    assert.strictEqual(typeof result.path, 'string');
    assert.ok(result.path.endsWith('.png'));
    assert.ok(fs.existsSync(result.path));
    // Clean up
    fs.unlinkSync(result.path);
    fs.rmdirSync(path.dirname(result.path));
  });

  it('Download with existing extension keeps it', async () => {
    const downloadPath = path.join(__dirname, 'tmp', 'test-image.png');
    const result = await fetch('https://httpbin.org/image/png', { log: log, tries: 1, download: downloadPath });
    assert.strictEqual(result.path, downloadPath);
    assert.ok(fs.existsSync(result.path));
    // Clean up
    fs.unlinkSync(result.path);
    fs.rmdirSync(path.dirname(result.path));
  });

  // --- attachResponseHeaders ---

  it('attachResponseHeaders adds headers to error', async () => {
    try {
      await fetch('https://httpbin.org/status/400', { log: log, tries: 1, attachResponseHeaders: true });
      assert.fail('Should have thrown an error');
    } catch (e) {
      assert.strictEqual(e.status, 400);
      assert.ok(e['content-type'] || e['content-length'] !== undefined, 'Error should have response headers attached');
    }
  });

});
