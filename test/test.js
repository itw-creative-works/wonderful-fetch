const wonderfulFetch = require('../dist/index.js');

(async function() {
  console.log('Requesting status 200');
  await wonderfulFetch('https://httpbin.org/status/200', {log: true, tries: 1})
    .then(result => {
      console.log('Result', result);
    })
    .catch(e => {
      console.error('Error', e);
    })


  console.log('Requesting status 500');
  await wonderfulFetch('https://httpbin.org/status/500', {log: true, tries: 2})
    .then(result => {
      console.log('Result', result);
    })
    .catch(e => {
      console.error('Error', e);
    })

  console.log('Requesting status 200 with JSON');
  await wonderfulFetch('https://httpbin.org/status/200', {log: true, tries: 1, body: {test: ''}})
    .then(result => {
      console.log('Result', result);
    })
    .catch(e => {
      console.error('Error', e);
    })

  console.log('Requesting status 200 with JSON, responseFormat=json');
  await wonderfulFetch('https://httpbin.org/status/200', {log: true, tries: 1, responseFormat: 'json', body: {test: ''}})
    .then(result => {
      console.log('Result', result);
    })
    .catch(e => {
      console.error('Error', e);
    })

  console.log('Requesting status 200 with JSON, responseFormat=raw');
  await wonderfulFetch('https://httpbin.org/status/200', {log: true, tries: 1, responseFormat: 'raw', body: {test: ''}})
    .then(result => {
      console.log('Result', result);
    })
    .catch(e => {
      console.error('Error', e);
    })

  console.log('Requesting status 200 with JSON, method=post, responseFormat=json');
  await wonderfulFetch('https://httpbin.org/status/200', {log: true, tries: 1, method: 'post', responseFormat: 'json', body: {test: ''}})
    .then(result => {
      console.log('Result', result);
    })
    .catch(e => {
      console.error('Error', e);
    })

  console.log('Requesting status 200 with JSON, responseFormat=text');
  await wonderfulFetch('https://httpbin.org/status/200', {log: true, tries: 1, method: 'post', responseFormat: 'text', body: {test: ''}})
    .then(result => {
      console.log('Result', result);
    })
    .catch(e => {
      console.error('Error', e);
    })

  console.log('Requesting plaintext');
  await wonderfulFetch('https://api.my-ip.io/ip', {log: true, tries: 1, responseFormat: 'text'})
    .then(result => {
      console.log('Result', result);
    })
    .catch(e => {
      console.error('Error', e);
    })

  console.log('Requesting json');
  await wonderfulFetch('https://api.my-ip.io/ip.json', {log: true, tries: 1, responseFormat: 'json'})
    .then(result => {
      console.log('Result', result);
    })
    .catch(e => {
      console.error('Error', e);
    })


}());
