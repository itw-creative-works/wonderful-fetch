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
  <strong>wonderful-fetch</strong> is an easy wrapper for the <code>fetch</code> api that works in Node.js and the browser!
  <br>
  <br>
  <img src="https://media.giphy.com/media/3o7WIEVjXL8EH3a1mE/giphy.gif">
  <br>
  <br>
</p>

## 🌐 Wonderful Fetch Works in Node AND browser environments
Yes, this module works in both Node and browser environments, including compatibility with [Webpack](https://www.npmjs.com/package/webpack) and [Browserify](https://www.npmjs.com/package/browserify)!

## ⚡️ Features
* Intuitive error handling
* Download files directly to drive

<!-- ### 🔑 Getting an API key -->
<!-- You can use so much of `wonderful-fetch` for free, but if you want to do some advanced stuff, you'll need an API key. You can get one by signing up for an account at [https://wonderful-fetch.dev/signup](https://wonderful-fetch.dev/signup). -->

## 🪦 The old way
You have to manually check if the response is `ok` and then parse the response as JSON.
```js
fetch('https://httpbin.org/json')
  .then((response) => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then((data) => console.log(data))
  .catch((error) => console.error(error));
```

## 🦄 The Wonderful Fetch way
With Wonderful Fetch, you can automatically parse the response as JSON and handle all http errors with a single line of code.
```js
wonderfulFetch('https://httpbin.org/json', {response: 'json'})
  .then((response) => console.log(response))
  .catch((error) => console.error(error));
```

## 📦 Install Wonderful Fetch
### Option 1: Install via npm
Install with npm if you plan to use `wonderful-fetch` in a Node project or in the browser.
```shell
npm install wonderful-fetch
```
If you plan to use `wonderful-fetch` in a browser environment, you will probably need to use [Webpack](https://www.npmjs.com/package/webpack), [Browserify](https://www.npmjs.com/package/browserify), or a similar service to compile it.

```js
const wonderfulFetch = require('wonderful-fetch');
wonderfulFetch();
```

### Option 2: Install via CDN
Install with CDN if you plan to use Wonderful Fetch only in a browser environment.
```html
<script src="https://cdn.jsdelivr.net/npm/wonderful-fetch@latest/dist/index.min.js"></script>
<script type="text/javascript">
  var wonderfulFetch = WonderfulFetch;
  wonderfulFetch();
</script>
```

## 🚀 Using Wonderful Fetch
After you have followed the install step, you can start using `wonderful-fetch` to make requests to any URL

### wonderfulFetch(url, options)
Make a request to the supplied `url` with `options`.

This library returns a `Promise` that will resolve if the status code is in the `200` - `299` range and will reject if the status code is outside that range or if the download of the file fails.

#### options
The options for `wonderfulFetch(url, options)` are as follows.
* url `string`: The URL of the resource
  * Acceptable Values: `any`
  * Default: `null`
* options `object`: Advanced options
  * method `string`: The type of request
    * Acceptable Values: `get`, `post`, `delete`, `put`, `patch`
    * Default: `get`
  * response `string`: Automatically format the response
    * Acceptable Values: `raw`, `json`, `text`
    * Default: `raw`
  * timeout `number`: The request will automatically timeout after this
    * Acceptable Values: `any`
    * Default: `60000`
  * tries `number`: The amount of attempts to the URL. Enter `-1` for infinity.
    * Acceptable Values: `any`
    * Default: `1`
  * cacheBreaker `boolean`, `any`: Will append `?cb={currentTime}` to the URL if `true` or whatever value you specify.
    * Acceptable Values: `true`, `false`, `any`
    * Default: `true`
  * download `string`: Will download the response to this path
    * Acceptable Values: `any`
    * Default: `null`

#### Examples
##### Basic Fetch
Perform a basic fetch request.
```js
wonderfulFetch('https://httpbin.org/status/200', {method: 'get'})
  .then((response) => console.log(response))
  .catch((error) => console.error(error));
```

##### Basic Fetch JSON
Perform a basic fetch request and return the response as JSON.
```js
wonderfulFetch('https://httpbin.org/status/200', {method: 'get', response: 'json'})
  .then((response) => console.log(response))
  .catch((error) => console.error(error));
```

##### Download File
Download a file to the specified `download` path. Node.js only.
```js
wonderfulFetch('https://httpbin.org/image/png', {download: './image.png'})
  .then((response) => console.log(response))
  .catch((error) => console.error(error));
```


##### Handle Errors with `catch`
Handle errors with the `catch` method.
```js
wonderfulFetch('https://httpbin.org/status/404', {method: 'get'})
  .then((response) => console.log(response))
  .catch((error) => console.error(error));
```


## 📚 Extending Capabilities
For a more in-depth documentation of this library and the Wonderful Fetch service, please visit the official Wonderful Fetch website.

## ❓ What Can Wonderful Fetch do?
Wonderful Fetch is a free fetch api that helps you make requests in Node.js or the browser.

## 📝 Final Words
If you are still having difficulty, we would love for you to post a question to [the Wonderful Fetch issues page](https://github.com/itw-creative-works/wonderful-fetch/issues). It is much easier to answer questions that include your code and relevant files! So if you can provide them, we'd be extremely grateful (and more likely to help you find the answer!)

## 🎉 Projects Using this Library
[Somiibo](https://somiibo.com/): A Social Media Bot with an open-source module library. <br>
[JekyllUp](https://jekyllup.com/): A website devoted to sharing the best Jekyll themes. <br>
[Slapform](https://slapform.com/): A backend processor for your HTML forms on static sites. <br>
[SoundGrail Music App](https://app.soundgrail.com/): A resource for producers, musicians, and DJs. <br>
[Hammock Report](https://hammockreport.com/): An API for exploring and listing backyard products. <br>

Ask us to have your project listed! :)
