export function parseHeaders(res) {
  const headers = {};

  if (!res || !res.headers) {
    return headers;
  }

  res.headers.forEach(function (value, key) {
    try {
      headers[key] = JSON.parse(value);
    } catch (e) {
      headers[key] = value;
    }
  });

  return headers;
}

export async function parseResponse(res, options) {
  if (options.response === 'raw') {
    return res;
  }

  const text = await res.text();

  if (options.response === 'json') {
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(`Response is not JSON: ${e}`);
    }
  }

  return text;
}

export function formatOutput(res, result, options) {
  if (options.output === 'body') {
    return result;
  }

  return {
    status: res.status,
    headers: parseHeaders(res),
    body: result,
  };
}

export function buildError(res, options) {
  const headers = parseHeaders(res);

  return res.text().then(function (text) {
    const error = new Error(text || res.statusText || 'Unknown error');
    error.status = res.status;

    // Merge bm-properties into error
    if (headers['bm-properties']) {
      try {
        Object.keys(headers['bm-properties']).forEach(function (key) {
          error[key] = headers['bm-properties'][key];
        });
      } catch (e) {
        console.warn('Failed to add bm-properties to error object', e);
      }
    }

    // Attach all response headers if requested
    if (options.attachResponseHeaders) {
      Object.keys(headers).forEach(function (key) {
        if (key !== 'bm-properties') {
          error[key] = headers[key];
        }
      });
    }

    return error;
  });
}
