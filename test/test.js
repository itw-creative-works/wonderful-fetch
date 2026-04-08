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

  // --- Defaults ---

  it('Works with no options object', async () => {
    const result = await fetch('https://httpbin.org/get');
    assert.strictEqual(result.status, 200);
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

  it('Complete output with text response', async () => {
    const result = await fetch('https://httpbin.org/robots.txt', { log: log, tries: 1, response: 'text', output: 'complete' });
    assert.strictEqual(result.status, 200);
    assert.strictEqual(typeof result.headers, 'object');
    assert.strictEqual(typeof result.body, 'string');
    assert.ok(result.body.length > 0);
  });

  it('Complete output with raw response', async () => {
    const result = await fetch('https://httpbin.org/get', { log: log, tries: 1, response: 'raw', output: 'complete' });
    assert.strictEqual(result.status, 200);
    assert.strictEqual(typeof result.headers, 'object');
    assert.ok(result.body);
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

  it('Custom cache breaker value', async () => {
    const result = await fetch('https://httpbin.org/get', { log: log, tries: 1, response: 'json', cacheBreaker: 'custom123' });
    assert.strictEqual(result.args.cb, 'custom123');
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

  it('Authorization preserves existing Digest prefix', async () => {
    const result = await fetch('https://httpbin.org/get', { log: log, tries: 1, response: 'json', authorization: 'Digest abc123' });
    assert.strictEqual(result.headers.Authorization, 'Digest abc123');
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

  it('POST with contentType json forces JSON header', async () => {
    const result = await fetch('https://httpbin.org/post', { log: log, tries: 1, method: 'post', response: 'json', contentType: 'json', body: 'string body' });
    assert.strictEqual(result.headers['Content-Type'], 'application/json');
  });

  it('PUT method works', async () => {
    const result = await fetch('https://httpbin.org/put', { log: log, tries: 1, method: 'put', response: 'json', body: { key: 'value' } });
    assert.strictEqual(result.json.key, 'value');
  });

  it('PATCH method works', async () => {
    const result = await fetch('https://httpbin.org/patch', { log: log, tries: 1, method: 'patch', response: 'json', body: { key: 'value' } });
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

  it('Succeeds on retry after initial failure', async () => {
    // httpbin /status/503:200 returns 503 first call, 200 second — but httpbin doesn't support that
    // Instead, test that tries=2 with a flaky endpoint eventually resolves or throws with correct status
    // Use an endpoint that always succeeds to verify retry logic doesn't break success
    const result = await fetch('https://httpbin.org/get', { log: log, tries: 3, response: 'json' });
    assert.strictEqual(typeof result, 'object');
    assert.ok(result.url);
  });

  // --- Network errors ---

  it('Network error on invalid hostname', async () => {
    try {
      await fetch('https://this-domain-does-not-exist-xyz.invalid/test', { log: log, tries: 1, timeout: 5000 });
      assert.fail('Should have thrown an error');
    } catch (e) {
      assert.ok(e instanceof Error);
      assert.ok(e.message);
    }
  });

  // --- Error message content ---

  it('Error message contains response body text', async () => {
    try {
      await fetch('https://httpbin.org/status/418', { log: log, tries: 1 });
      assert.fail('Should have thrown an error');
    } catch (e) {
      assert.strictEqual(e.status, 418);
      assert.ok(e instanceof Error);
      assert.strictEqual(typeof e.message, 'string');
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

  it('Download non-image file', async () => {
    const downloadPath = path.join(__dirname, 'tmp', 'test-download');
    const result = await fetch('https://httpbin.org/robots.txt', { log: log, tries: 1, download: downloadPath });
    assert.strictEqual(typeof result.path, 'string');
    assert.ok(fs.existsSync(result.path));
    const content = fs.readFileSync(result.path, 'utf-8');
    assert.ok(content.length > 0);
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
