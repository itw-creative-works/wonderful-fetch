<p align="center">
  <a href="https://itwcreativeworks.com">
    <img src="https://cdn.itwcreativeworks.com/assets/itw-creative-works/images/logo/itw-creative-works-brandmark-black-x.svg" width="100px">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/package-json/v/itw-creative-works/wonderful-fetch.svg">
  <br>
  <img src="https://img.shields.io/librariesio/release/npm/wonderful-fetch.svg">
  <img src="https://img.shields.io/bundlephobia/min/wonderful-fetch.svg">
  <img src="https://img.shields.io/codeclimate/maintainability-percentage/itw-creative-works/wonderful-fetch.svg">
  <img src="https://img.shields.io/npm/dm/wonderful-fetch.svg">
  <img src="https://img.shields.io/node/v/wonderful-fetch.svg">
  <img src="https://img.shields.io/website/https/itwcreativeworks.com.svg">
  <img src="https://img.shields.io/github/license/itw-creative-works/wonderful-fetch.svg">
  <img src="https://img.shields.io/github/contributors/itw-creative-works/wonderful-fetch.svg">
  <img src="https://img.shields.io/github/last-commit/itw-creative-works/wonderful-fetch.svg">
  <br>
  <br>
  <a href="https://itwcreativeworks.com">Site</a> | <a href="https://www.npmjs.com/package/wonderful-fetch">NPM Module</a> | <a href="https://github.com/itw-creative-works/wonderful-fetch">GitHub Repo</a>
  <br>
  <br>
  <strong>wonderful-fetch</strong> is a powerful wrapper around the native <code>fetch</code> API that works in Node.js and the browser.
  <br>
  <br>
</p>

## Features
* Works in both Node.js and browser environments (including Webpack)
* Automatic JSON response parsing
* Automatic retries with exponential backoff
* Request timeouts via AbortController
* Authorization header management
* Query parameter building
* Cache busting
* File downloads (Node.js only)
* Error objects enriched with HTTP status codes

## Install

### npm
```shell
npm install wonderful-fetch
```

```js
// ESM (recommended)
import fetch from 'wonderful-fetch';

// CommonJS
const fetch = require('wonderful-fetch').default;

// Named import (ESM or CommonJS)
const { WonderfulFetch } = require('wonderful-fetch');
```

### CDN
```html
<script src="https://cdn.jsdelivr.net/npm/wonderful-fetch@latest/dist/wonderful-fetch.min.js"></script>
<script>
  WonderfulFetch('https://api.example.com/data', { response: 'json' })
    .then(data => console.log(data));
</script>
```

## Usage

### Basic request
```js
const res = await fetch('https://httpbin.org/status/200');
console.log(res.status); // 200
```

### JSON response
```js
const data = await fetch('https://httpbin.org/json', { response: 'json' });
console.log(data);
```

### POST with JSON body
```js
const data = await fetch('https://httpbin.org/post', {
  method: 'post',
  body: { hello: 'world' },
  response: 'json',
});
```

### Complete output (status + headers + body)
```js
const result = await fetch('https://httpbin.org/get', {
  response: 'json',
  output: 'complete',
});
console.log(result.status);  // 200
console.log(result.headers); // { ... }
console.log(result.body);    // { ... }
```

### Retries with backoff
```js
const data = await fetch('https://httpbin.org/get', {
  response: 'json',
  tries: 3,       // Retry up to 3 times
  timeout: 10000, // 10 second timeout per attempt
});
```

### Authorization
```js
// Automatically prefixes "Bearer " if no prefix is present
const data = await fetch('https://httpbin.org/get', {
  response: 'json',
  authorization: 'my-token',
});

// Or use an existing prefix
const data = await fetch('https://httpbin.org/get', {
  response: 'json',
  authorization: 'Basic abc123',
});
```

### Download file (Node.js only)
```js
const result = await fetch('https://httpbin.org/image/png', {
  download: './image',
});
console.log(result.path); // ./image.png (extension auto-detected)
```

### Error handling
Errors from non-2xx responses include the HTTP status code:
```js
try {
  await fetch('https://httpbin.org/status/404');
} catch (err) {
  console.log(err.message); // Response body text
  console.log(err.status);  // 404
}
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `method` | `string` | `'get'` | HTTP method (`get`, `post`, `put`, `delete`, `patch`) |
| `response` | `string` | `'raw'` | Response format: `'raw'`, `'json'`, or `'text'` |
| `output` | `string` | `'body'` | Output format: `'body'` (parsed response only) or `'complete'` (`{ status, headers, body }`) |
| `timeout` | `number` | `60000` | Request timeout in milliseconds |
| `tries` | `number` | `1` | Number of retry attempts. `0` for infinite retries |
| `headers` | `object` | `{}` | Custom request headers |
| `body` | `any` | `null` | Request body. Objects are auto-stringified as JSON |
| `query` | `object` | `{}` | URL query parameters |
| `authorization` | `string\|false` | `false` | Sets `Authorization` header. Auto-prefixes `Bearer` if no prefix |
| `cacheBreaker` | `boolean\|any` | `true` | Appends `?cb={timestamp}` to URL. Pass `false` to disable |
| `contentType` | `string` | `''` | Force content type (e.g. `'json'`) |
| `download` | `string\|false` | `false` | File path to download response to (Node.js only) |
| `attachResponseHeaders` | `boolean` | `false` | Attach response headers to error objects |
| `log` | `boolean` | `false` | Enable debug logging |

## Final words
If you are still having difficulty, we would love for you to post a question to [the Wonderful Fetch issues page](https://github.com/itw-creative-works/wonderful-fetch/issues). It is much easier to answer questions that include your code and relevant files! So if you can provide them, we'd be extremely grateful (and more likely to help you find the answer!)

## Projects using this library
[Somiibo](https://somiibo.com/): A Social Media Bot with an open-source module library. <br>
[JekyllUp](https://jekyllup.com/): A website devoted to sharing the best Jekyll themes. <br>
[Slapform](https://slapform.com/): A backend processor for your HTML forms on static sites. <br>
[SoundGrail Music App](https://app.soundgrail.com/): A resource for producers, musicians, and DJs. <br>
[Hammock Report](https://hammockreport.com/): An API for exploring and listing backyard products. <br>

Ask us to have your project listed! :)
