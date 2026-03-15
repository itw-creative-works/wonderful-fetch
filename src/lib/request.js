export function buildRequest(url, options) {
  const bodyIsObject = options.body && typeof options.body === 'object';
  const bodyIsFormData = bodyIsObject && typeof options.body.append === 'function';

  // Build config
  const config = {
    method: options.method,
    headers: { ...options.headers },
    body: null,
  };

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

  // Set Content-Type for JSON
  if (
    (bodyIsObject && !bodyIsFormData)
    || options.contentType === 'json'
  ) {
    config.headers['Content-Type'] = 'application/json';
  }

  // GET requests should not have a body or Content-Type
  if (config.method === 'get') {
    delete config.body;
    delete config.headers['Content-Type'];
  }

  // Authorization
  if (options.authorization) {
    const auth = options.authorization;
    config.headers['Authorization'] = auth.match(/^Bearer |^Basic |^Digest /)
      ? auth
      : `Bearer ${auth}`;
  }

  // Build URL with query params and cache breaker
  const urlObj = new URL(url);

  Object.keys(options.query).forEach(function (key) {
    urlObj.searchParams.set(key, options.query[key]);
  });

  const cacheBreaker = options.cacheBreaker === true
    ? Math.floor(Date.now() / 1000)
    : options.cacheBreaker;

  if (cacheBreaker) {
    urlObj.searchParams.set('cb', cacheBreaker);
  }

  // Log
  if (options.log) {
    console.log('Fetch configuration:', {
      bodyIsFormData,
      bodyIsObject,
      options,
      config,
    });
  }

  return { url: urlObj.toString(), config };
}
