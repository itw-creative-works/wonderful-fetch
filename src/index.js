import { normalizeOptions } from './lib/defaults.js';
import { buildRequest } from './lib/request.js';
import { parseResponse, formatOutput, buildError } from './lib/response.js';
import { executeWithRetry } from './lib/retry.js';
import { handleDownload } from './lib/download.js';

const VERSION = '{version}';

async function WonderfulFetch(url, options) {
  // Normalize options and validate
  const normalized = normalizeOptions(url, options);
  url = normalized.url;
  options = normalized.options;

  // Build request config
  const { url: requestUrl, config } = buildRequest(url, options);

  // Execute with retry
  return executeWithRetry(async function (signal) {
    // Attach abort signal for timeout
    const fetchConfig = { ...config };
    if (signal) {
      fetchConfig.signal = signal;
    }

    // Resolve fetch function
    const fetchFn = (typeof window !== 'undefined' && window.fetch) || globalThis.fetch;

    // Log
    if (options.log) {
      console.log('Fetching:', requestUrl);
    }

    // Perform fetch
    const res = await fetchFn(requestUrl, fetchConfig);

    // Handle download (Node-only)
    if (res.ok && options.download) {
      const result = await handleDownload(res, options);
      return formatOutput(res, result, options);
    }

    // Handle error responses
    if (!res.ok) {
      const error = await buildError(res, options);
      throw error;
    }

    // Parse successful response
    const result = await parseResponse(res, options);
    return formatOutput(res, result, options);
  }, options);
}

// Browser environment
if (typeof window !== 'undefined') {
  window.WonderfulFetch = WonderfulFetch;
}

export default WonderfulFetch;
export { WonderfulFetch };
