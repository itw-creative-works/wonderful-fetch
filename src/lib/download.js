// Node-only module — all requires are lazy to avoid bundling Node builtins

export function handleDownload(res, options) {
  const { Readable } = require('stream');
  const jetpack = require('fs-jetpack');
  const mime = require('mime-types');
  const path = require('path');

  return new Promise(function (resolve, reject) {
    // Get content type and determine extension
    const type = res.headers.get('content-type');
    const ext = (mime.extension(type) || '')
      .replace('jpeg', 'jpg');

    // Create directory if it doesn't exist
    if (!jetpack.exists(options.download)) {
      const dir = path.dirname(options.download);
      jetpack.dir(dir);
    }

    // Add extension if there isn't one
    const existingExt = path.extname(options.download);
    if (!existingExt) {
      options.download += `.${ext}`;
    }

    // Convert web ReadableStream to Node stream
    const nodeStream = Readable.fromWeb(res.body);

    // Stream response to file
    const fileStream = jetpack.createWriteStream(options.download);
    nodeStream.pipe(fileStream);

    nodeStream.on('error', function (e) {
      reject(new Error(`Failed to download: ${e}`));
    });

    fileStream.on('finish', function () {
      resolve({
        res: res,
        path: options.download,
      });
    });
  });
}
