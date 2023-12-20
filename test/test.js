const package = require('../package.json');
const assert = require('assert');
const log = false;

describe(`${package.name}`, () => {
  const wonderfulFetch = require('../dist/index.js');

  it('Requesting status 200', async () => {
    const result = await wonderfulFetch('https://httpbin.org/status/200', { log: log, tries: 1 });
    assert.strictEqual(result.status, 200);
  });

  it('Requesting status 500', async () => {
    try {
      await wonderfulFetch('https://httpbin.org/status/500', { log: log, tries: 2 });
    } catch (e) {
      assert.strictEqual(e.status, 500);
    }
  });

  it('Requesting plaintext', async () => {
    const result = await wonderfulFetch('https://us-central1-ultimate-jekyll.cloudfunctions.net/test', { log: log, tries: 1, response: 'json', output: 'complete' });
    assert.strictEqual(typeof result.headers, 'object');
  });

  it('Requesting error', async () => {
    await wonderfulFetch('https://us-central1-ultimate-jekyll.cloudfunctions.net/test?error=Error+test', { log: log, tries: 1, response: 'text', output: 'complete' })
    .then(() => {
      assert.fail('Should have thrown an error');
    })
    .catch(e => {
      assert.equal(e instanceof Error, true);
    });
  });

  // it('Requesting status 200 with JSON', async () => {
  //   const result = await wonderfulFetch('https://httpbin.org/status/200', { log: log, tries: 1, body: { test: '' } });
  //   assert.strictEqual(result.status, 200);
  // });

  // it('Requesting status 200 with JSON, response=raw', async () => {
  //   const result = await wonderfulFetch('https://httpbin.org/status/200', { log: log, tries: 1, response: 'raw', body: { test: '' } });
  //   assert.ok(result); // You may need to replace this with a more specific assertion based on what 'raw' response looks like
  // });

  it('Requesting plaintext', async () => {
    const result = await wonderfulFetch('https://api.my-ip.io/ip', { log: log, tries: 1, response: 'text' });
    assert.strictEqual(typeof result, 'string');
  });

  it('Requesting json', async () => {
    const result = await wonderfulFetch('https://api.my-ip.io/ip.json', { log: log, tries: 1, response: 'json' });
    assert.strictEqual(typeof result, 'object');
  });
});
