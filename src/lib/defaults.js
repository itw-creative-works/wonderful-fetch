export function normalizeOptions(url, options) {
  // Allow url from options
  url = url || options.url;

  // Validate
  if (!url) {
    throw new Error('No URL provided.');
  }

  // Apply defaults
  options = options || {};
  options.timeout = options.timeout || 60000;
  options.tries = typeof options.tries === 'undefined' ? 1 : options.tries;
  options.log = typeof options.log === 'undefined' ? false : options.log;
  options.method = (options.method || 'get').toLowerCase();
  options.cacheBreaker = typeof options.cacheBreaker === 'undefined' ? true : options.cacheBreaker;
  options.contentType = (typeof options.contentType === 'undefined' ? '' : options.contentType).toLowerCase();
  options.response = (typeof options.response === 'undefined' ? 'raw' : options.response).toLowerCase();
  options.output = typeof options.output === 'undefined' ? 'body' : options.output;
  options.authorization = typeof options.authorization === 'undefined' ? false : options.authorization;
  options.attachResponseHeaders = typeof options.attachResponseHeaders === 'undefined' ? false : options.attachResponseHeaders;
  options.download = options.download || false;
  options.headers = options.headers || {};
  options.query = options.query || {};
  options.body = options.body || null;

  return { url, options };
}
