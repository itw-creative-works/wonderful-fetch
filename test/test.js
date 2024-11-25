const package = require('../package.json');
const assert = require('assert');
const log = false;

describe(`${package.name}`, () => {
  const fetch = require('../dist/index.js');

  // Test for requesting status 200
  it('Requesting status 200', async () => {
    const result = await fetch('https://httpbin.org/status/200', { log: log, tries: 1 });
    assert.strictEqual(result.status, 200);
  });

  // Test for requesting status 500
  it('Requesting status 500', async () => {
    try {
      await fetch('https://httpbin.org/status/500', { log: log, tries: 2 });
    } catch (e) {
      assert.strictEqual(e.status, 500);
    }
  });

  // Test for requesting plaintext response
  it('Requesting plaintext', async () => {
    const result = await fetch('https://us-central1-ultimate-jekyll.cloudfunctions.net/test', { log: log, tries: 1, response: 'json', output: 'complete' });
    assert.strictEqual(typeof result.headers, 'object');
  });

  // Test for requesting an error response
  it('Requesting error', async () => {
    await fetch('https://us-central1-ultimate-jekyll.cloudfunctions.net/test?error=Error+test', { log: log, tries: 1, response: 'text', output: 'complete' })
    .then(() => {
      assert.fail('Should have thrown an error');
    })
    .catch(e => {
      assert.equal(e instanceof Error, true);
    });
  });

  // it('Requesting status 200 with JSON', async () => {
  //   const result = await fetch('https://httpbin.org/status/200', { log: log, tries: 1, body: { test: '' } });
  //   assert.strictEqual(result.status, 200);
  // });

  // it('Requesting status 200 with JSON, response=raw', async () => {
  //   const result = await fetch('https://httpbin.org/status/200', { log: log, tries: 1, response: 'raw', body: { test: '' } });
  //   assert.ok(result); // You may need to replace this with a more specific assertion based on what 'raw' response looks like
  // });

  // Test for requesting plaintext response
  it('Requesting plaintext', async () => {
    const result = await fetch('https://api.my-ip.io/ip', { log: log, tries: 1, response: 'text' });
    assert.strictEqual(typeof result, 'string');
  });

  // Test for requesting JSON response
  it('Requesting json', async () => {
    const result = await fetch('https://api.my-ip.io/ip.json', { log: log, tries: 1, response: 'json' });
    assert.strictEqual(typeof result, 'object');
  });

  // New test for requesting with authorization set to "firebase"
  it('Requesting with authorization', async () => {
    const result = await fetch('https://example.com/protected', { log: log, tries: 1, authorization: 'firebase' });
    assert.strictEqual(result.status, 200);
  });
});
