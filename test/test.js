const wonderfulFetch = require('../dist/index.js');

(async function() {
  await wonderfulFetch('https://httpbin.org/status/200', {log: true, tries: 1})
    .then(result => {
      console.log('Result', result);
    })
    .catch(e => {
      console.error('Error', e);
    })


  await wonderfulFetch('https://httpbin.org/status/500', {log: true, tries: 3})
    .then(result => {
      console.log('Result', result);
    })
    .catch(e => {
      console.error('Error', e);
    })
}());
