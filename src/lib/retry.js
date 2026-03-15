function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

export async function executeWithRetry(fn, options) {
  const maxTries = options.tries;
  const infinite = maxTries === 0;
  let lastError;

  for (let attempt = 1; infinite || attempt <= maxTries; attempt++) {
    // Backoff delay (skip on first attempt)
    if (attempt > 1) {
      const delay = Math.min(3000 * (attempt - 1), 60000);
      await sleep(delay);
    }

    // Log
    if (options.log) {
      console.log(`Fetch (${attempt}/${options.tries}): attempt`);
    }

    // Set up timeout via AbortController
    let controller;
    let timeoutId;

    if (options.timeout > 0) {
      controller = new AbortController();
      timeoutId = setTimeout(function () {
        controller.abort();
      }, options.timeout);
    }

    try {
      const result = await fn(controller ? controller.signal : undefined);
      clearTimeout(timeoutId);
      return result;
    } catch (e) {
      clearTimeout(timeoutId);

      // Convert AbortError to timeout error
      if (e.name === 'AbortError') {
        lastError = new Error('Request timed out');
      } else {
        lastError = e;
      }

      // If out of retries, throw
      if (!infinite && attempt >= maxTries) {
        throw lastError;
      }
    }
  }
}
