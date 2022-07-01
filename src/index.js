(function (root, factory) {
  // https://github.com/umdjs/umd/blob/master/templates/returnExports.js
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.returnExports = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  var JSON5;
  var jetpack;

  var environment = (Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]') ? 'node' : 'browser';
  // var isRemoteURL = /^https?:\/\/|^\/\//i;
  var SOURCE = 'library';
  var VERSION = '{version}';

  function WonderfulFetch(url, options) {
    return new Promise(function(resolve, reject) {
      var nodeFetch;

      options = options || {};
      options.timeout = options.timeout || 60000;
      options.tries = typeof options.tries === 'undefined' ? 1 : options.tries;
      options.log = typeof options.log === 'undefined' ? false : options.log;
      options.cacheBreaker = typeof options.cacheBreaker === 'undefined' ? true : options.cacheBreaker;
      options.contentType = typeof options.contentType === 'undefined' ? '' : options.contentType;
      options.responseFormat = typeof options.responseFormat === 'undefined' ? 'raw' : options.responseFormat;

      // Legacy
      if (options.raw) {
        options.responseFormat = 'raw'
      } else if (options.json) {
        options.responseFormat = 'json'
      } else if (options.text) {
        options.responseFormat = 'text'
      }

      url = url || options.url;

      var tries = 1;
      var maxTries = options.tries - 1;
      var infinite = options.tries === 0;

      var bodyIsFormData = typeof options.body === 'function' && options.body.append;
      var bodyIsObject = typeof options.body === 'object';

      if (!url) {
        return reject(new Error('No URL provided.'))
      }

      var fileStream;
      var config = {
        method: (options.method || 'get').toLowerCase(),
        headers: options.headers || {},
      }

      if (options.body) {
        if (bodyIsFormData) {
          config.body = options.body;
        } else if (bodyIsObject) {
          config.body = JSON.stringify(options.body);
        } else {
          config.body = options.body;
        }
      }

      // if (options.json && options.body && config.method === 'post') {
      //   config.headers['Content-Type'] = 'application/json';
      // }
      if (
        (bodyIsObject && !bodyIsFormData)
        || (options.contentType === 'json')
      ) {
        config.headers['Content-Type'] = 'application/json';
      }

      if (config.method === 'get') {
        delete config.body;
      }

      if (options.log) {
        console.log('Fetch configuration:', 'bodyIsFormData=' + bodyIsFormData, 'bodyIsObject=' + bodyIsObject, options, config);
      }

      var timeoutHolder;

      function _fetch() {
        var ms = Math.min((3000 * (tries - 1)), 60000);
        ms = ms > 0 ? ms : 1;

        url = new URL(url);
        var cacheBreaker = options.cacheBreaker === true ? Math.floor(new Date().getTime() / 1000) : options.cacheBreaker;
        if (cacheBreaker) {
          url.searchParams.set('cb', cacheBreaker)
        }
        url = url.toString();

        setTimeout(function () {
          if (options.log) {
            console.log('Fetch (' + tries + '/' + options.tries + ', ' + ms + 'ms): ', url);
          }

          function _resolve(r) {
            clearTimeout(timeoutHolder);
            return resolve(r);
          }

          function _reject(e) {
            clearTimeout(timeoutHolder);
            if (tries > maxTries && !infinite) {
              return reject(e);
            } else {
              return _fetch(tries++);
            }
          }

          clearTimeout(timeoutHolder);
          if (options.timeout > 0) {
            timeoutHolder = setTimeout(function () {
              return _reject(new Error('Request timed out'))
            }, options.timeout);
          }

          // Set nodeFetch again to be sure we're using the right one
          if (typeof window !== 'undefined' && 'fetch' in window) {
            nodeFetch = window.fetch;
          }
          nodeFetch = nodeFetch || require('node-fetch');

          nodeFetch(url, config)
            .then(function (res) {

              if (options.ok && options.download) {
                jetpack = jetpack || require('fs-jetpack');
                if (!jetpack.exists(options.download)) {
                  path = path || require('path');
                  var name = path.parse(options.download).name;
                  var ext = path.parse(options.download).ext;
                  var dir = options.download.replace(name + ext, '');
                  jetpack.dir(dir)
                }
                fileStream = jetpack.createWriteStream(options.download);
                res.body.pipe(fileStream);
                res.body.on('error', function (e) {
                  throw new Error(new Error('Failed to download: ' + e))
                });
                fileStream.on('finish', function() {
                  return _resolve({
                    path: options.download
                  });
                });
              } else {
                if (res.ok) {
                  if (options.responseFormat === 'raw') {
                    return _resolve(res);
                  } else {
                    res.text()
                    .then(function (text) {
                      if (options.responseFormat === 'json') {
                        JSON5 = JSON5 || require('json5');
                        try {
                          return _resolve(JSON5.parse(text));
                        } catch (e) {
                          throw new Error(new Error('Response is not JSON: ' + e))
                        }
                      } else {
                        return _resolve(text);
                      }
                    })
                    .catch(e => {
                      return _reject(e);
                    })
                  }
                } else {
                  res.text()
                    .then(function (text) {
                      var error = new Error(text || res.statusText || 'Unknown error');
                      Object.assign(error, { status: res.status })
                      throw error;
                    })
                    .catch(e => {
                      return _reject(e);
                    })
                }
              }
            })
            .catch(function (e) {
              return _reject(e)
            })
        }, ms);
      }
      _fetch();
    });

  };


  // Reference
  if (environment === 'browser') {
    try {
      window.WonderfulFetch = WonderfulFetch;
    } catch (e) {
    }
  }

  return WonderfulFetch;

}));
