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

  var JSONParser;
  var jetpack;
  var path;
  var mime;

  var environment = (Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]') ? 'node' : 'browser';
  // var isRemoteURL = /^https?:\/\/|^\/\//i;
  var SOURCE = 'library';
  var VERSION = '1.1.12';

  function WonderfulFetch(url, options) {
    return new Promise(function(resolve, reject) {
      var nodeFetch;

      // Fix options
      options = options || {};
      url = url || options.url;
      options.timeout = options.timeout || 60000;
      options.tries = typeof options.tries === 'undefined' ? 1 : options.tries;
      options.log = typeof options.log === 'undefined' ? false : options.log;
      options.cacheBreaker = typeof options.cacheBreaker === 'undefined' ? true : options.cacheBreaker;
      options.contentType = (typeof options.contentType === 'undefined' ? '' : options.contentType).toLowerCase();
      options.response = (typeof options.response === 'undefined' ? 'raw' : options.response).toLowerCase();
      options.output = typeof options.output === 'undefined' ? 'body' : options.output;
      options.attachResponseHeaders = typeof options.attachResponseHeaders === 'undefined' ? false : options.attachResponseHeaders;

      // Legacy
      if (options.raw) {
        options.response = 'raw';
      } else if (options.json) {
        options.response = 'json';
      } else if (options.text) {
        options.response = 'text';
      }

      var tries = 1;
      var maxTries = options.tries - 1;
      var infinite = options.tries === 0;

      var bodyIsObject = options.body && typeof options.body === 'object';
      var bodyIsFormData = bodyIsObject && typeof options.body.append === 'function';

      // Check if URL is provided
      if (!url) {
        return reject(new Error('No URL provided.'))
      }

      // Build configuration
      var config = {
        method: (options.method || 'get').toLowerCase(),
        headers: options.headers || {},
        body: null,
      }

      // Format body
      if (options.body) {
        if (bodyIsFormData) {
          config.body = options.body;
        } else if (bodyIsObject) {
          config.body = JSON.stringify(options.body);
        } else {
          config.body = options.body;
        }
      }

      // Set content type
      if (
        (bodyIsObject && !bodyIsFormData)
        || (options.contentType === 'json')
      ) {
        config.headers['Content-Type'] = 'application/json';
      }

      // FormData Headers
      // if (bodyIsFormData) {
      //   config.headers['Content-Type'] = 'multipart/form-data';
      //   Object.keys(options.body.getHeaders()).forEach(function (key) {
      //     config.headers[key] = options.body.getHeaders()[key];
      //     console.log('+++key', key, config.headers[key]);
      //   });
      // }

      // GET requests should not have a body or content type
      if (config.method === 'get') {
        delete config.body;
        delete config.headers['Content-Type'];
      }

      // Log
      if (options.log) {
        console.log('Fetch configuration:', 'bodyIsFormData=' + bodyIsFormData, 'bodyIsObject=' + bodyIsObject, options, config);
      }

      // Set timeout
      var timeoutHolder;

      // Fetch
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

          function _output(res, result) {
            var headers = {};
            var isError = result instanceof Error;

            // Iterate over headers and add them to the object
            if (res && res.headers) {
              res.headers.forEach(function (value, key) {
                // Parse JSON headers
                try {
                  headers[key] = JSON.parse(value);
                } catch (e) {
                  headers[key] = value;
                }

                if (!isError) {
                  return;
                }

                // Add bm-properties to error object
                if (key === 'bm-properties') {
                  try {
                    Object.keys(headers[key]).forEach(function (k) {
                      result[k] = headers[key][k];
                    })
                  } catch (e) {
                    console.warn('Failed to add bm-properties to error object', e);
                  }
                } else if (options.attachResponseHeaders) {
                  result[key] = headers[key];
                }
              });
            }

            // Format output
            if (isError || options.output === 'body') {
              return result;
            } else {
              return {
                status: res.status,
                headers: headers,
                body: result,
              }
            }
          }

          function _resolve(res, result) {
            clearTimeout(timeoutHolder);
            return resolve(_output(res, result));
          }

          function _reject(res, e) {
            clearTimeout(timeoutHolder);
            if (tries > maxTries && !infinite) {
              return reject(_output(res, e));
            } else {
              return _fetch(tries++);
            }
          }

          clearTimeout(timeoutHolder);
          if (options.timeout > 0) {
            timeoutHolder = setTimeout(function () {
              return _reject(undefined, new Error('Request timed out'))
            }, options.timeout);
          }

          // Set nodeFetch again to be sure we're using the right one
          if (typeof window !== 'undefined' && 'fetch' in window) {
            nodeFetch = window.fetch;
          }
          nodeFetch = nodeFetch || require('node-fetch');

          nodeFetch(url, config)
            .then(function (res) {

              if (res.ok && options.download) {
                // Load dependencies
                jetpack = jetpack || require('fs-jetpack');
                mime = mime || require('mime-types');

                // Get content type
                var type = res.headers.get('content-type');
                var ext = mime.extension(type)
                  .replace('jpeg', 'jpg')
                  // .replace('tiff', 'tif')
                  // .replace('svg+xml', 'svg');

                // Create directory if it doesn't exist
                if (!jetpack.exists(options.download)) {
                  path = path || require('path');

                  // Get directory
                  var dir = path.dirname(options.download);

                  // Create directory
                  jetpack.dir(dir);
                }

                // Add extension if there isn't one
                var existingExt = path.extname(options.download);
                if (!existingExt) {
                  options.download += '.' + ext;
                }

                // Create file stream
                var fileStream = jetpack.createWriteStream(options.download);

                // Pipe response to file
                res.body.pipe(fileStream);

                // Handle errors
                res.body.on('error', function (e) {
                  throw new Error(new Error('Failed to download: ' + e))
                });

                // Handle finish
                fileStream.on('finish', function() {
                  return _resolve(res, {
                    res: res,
                    path: options.download,
                  });
                });
              } else {
                if (res.ok) {
                  if (options.response === 'raw') {
                    return _resolve(res, res);
                  } else {
                    res.text()
                    .then(function (text) {
                      if (options.response === 'json') {

                        if (environment === 'node') {
                          JSONParser = JSONParser || require('json5');
                        } else {
                          JSONParser = typeof JSON5 === 'undefined' ? JSON : JSON5;
                        }

                        try {
                          return _resolve(res, JSONParser.parse(text));
                        } catch (e) {
                          throw new Error(new Error('Response is not JSON: ' + e))
                        }
                      } else {
                        return _resolve(res, text);
                      }
                    })
                    .catch(function (e) {
                      return _reject(res, e);
                    })
                  }
                } else {
                  res.text()
                    .then(function (text) {
                      var error = new Error(text || res.statusText || 'Unknown error');
                      Object.assign(error, { status: res.status });
                      throw error;
                    })
                    .catch(function (e) {
                      return _reject(res, e);
                    })
                }
              }
            })
            .catch(function (e) {
              return _reject(undefined, e)
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
