const wonderfulFetch = require('../dist/index.js');

wonderfulFetch('https://httpbin.org/status/200', {log: true, tries: 1})
  .then(result => {
    console.log('Result', result);
  })
  .catch(e => {
    console.error('Error', e);
  })
